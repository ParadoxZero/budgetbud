import React, { useState } from "react";
import { Button, Card, Divider, Empty, Flex, Input, InputNumber, Progress, ProgressProps, Skeleton, Space, Spin, Statistic } from "antd";
import { AccountBookOutlined, CheckCircleOutlined, LoadingOutlined, PlusCircleFilled, PlusCircleOutlined, PlusOutlined, RightCircleOutlined, RightOutlined, SmileOutlined, WalletOutlined } from '@ant-design/icons';
import { GetScreenSize, ScreenSize } from "../utils";
import { DataService, getDataService } from "../services/data_service";
import { Recurring, RecurringType, UserData } from "../datamodel/datamodel";
import { Typography } from "antd";
import { RecurringCalculatorService } from "../services/recurring_date_service";
import { BaseType } from "antd/es/typography/Base";

import '../main.css';

const { Title, Text } = Typography;

interface IProp { }
interface IState {
    user_data: UserData | null;
    total_allocations: number;
    filled_allocations: { [key: number]: number };
    upcoming_expense: { name: string, amount: number } | null;
    add_expense_mode_category: number | null;
}

export class OverviewPage extends React.Component<IProp, IState> {

    _data_service: DataService;
    _recurring_calculator_service: RecurringCalculatorService;

    render_available_budget() {
        return (
            <Card bordered={false} hoverable style={{ margin: 10 }} >
                <Statistic
                    title="Budget Used"
                    groupSeparator=""
                    value={Object.values(this.state.filled_allocations).reduce((acc, curr) => acc += curr, 0)}
                    precision={0}
                    // prefix={<CheckCircleOutlined />}
                    suffix={"/ " + (this.state.total_allocations).toString()}
                    valueStyle={{ color: '#3f8600' }}
                />
            </Card>
        )
    }

    render_upcoming() {
        let content = <Empty description="No upcoming expense" imageStyle={{ height: "auto", color: '#3f8600', fontSize: 48 }} image={<CheckCircleOutlined />} />;
        if (this.state.upcoming_expense != null) {
            content = <Statistic
                title="Upcoming"
                value={this.state.upcoming_expense.amount}
                prefix={<WalletOutlined />}
                suffix={this.state.upcoming_expense.name}
            />;
        }
        return (
            <Card bordered={false} hoverable style={{ margin: 10 }}>
                {content}
            </Card>
        )
    }

    header() {
        return (
            <Flex vertical={GetScreenSize() == ScreenSize.desktop}>
                {this.render_available_budget()}
                {this.render_upcoming()}
            </Flex>
        )
    }

    render_add_single_category_expense() {
        return (
            <div style={{ margin: 0, marginTop: 10, marginBottom: 10, paddingRight: 20, paddingLeft: 20, minWidth: 300 }} className='touchahble'>
                <Flex align="center" justify="space-between" style={{ minHeight: 100 }}>
                    <Input size="large" type="number" allowClear placeholder="Spent amount" autoFocus variant="borderless" minLength={250} inputMode="numeric" />
                    <Flex align="center" justify="right">
                        <Button shape="circle" type="default" icon={<PlusOutlined />} style={{ padding: 20, marginLeft: 20 }} onClick={(e) => { this.setState({ add_expense_mode_category: null }) }}></Button>
                        <Button shape="circle" type="default" icon={<RightOutlined />} style={{ padding: 20, marginLeft: 20 }} onClick={(e) => { alert('button'); e.stopPropagation(); }}></Button>
                    </Flex>
                </Flex>
            </div >
        )
    }

    render_view_single_category(id: number, title: string, value: number, total: number) {
        const percent = Math.floor((value / total) * 100);
        let progress_color = '#3f8600';
        let text_type: BaseType = "success";
        if (percent > 85) {
            progress_color = '#ff4d4f';
            text_type = "danger";
        }
        else if (percent > 60) {
            progress_color = '#ffa940';
            text_type = "warning";
        }

        const progress = <Progress
            type="line"
            percent={percent}
            strokeColor={progress_color}
            style={{
                marginBottom: 14,
                minWidth: 100
            }}
            status={percent < 100 ? "active" : "exception"}
        />

        return (
            <div style={{ margin: 0, marginTop: 10, marginBottom: 10, paddingRight: 20, paddingLeft: 20, minWidth: 300, minHeight: 100 }} className='touchahble' onClick={() => this.setState({ add_expense_mode_category: id })}>
                <Flex align="center" justify="space-between">
                    <Text strong type="secondary" style={{ fontSize: 18 }}>{title}</Text>
                    <Flex align="center" justify="right">
                        <Flex align="flex-end" justify="center" vertical>
                            <Text type="secondary"> Remaining</Text>
                            <Text strong type={text_type}>{total - value} / {total} </Text>
                            {progress}
                        </Flex>
                        <Button shape="circle" type="default" icon={<RightOutlined />} style={{ padding: 20, marginLeft: 20 }} onClick={(e) => { alert('button'); e.stopPropagation(); }}></Button>
                    </Flex>
                </Flex>
            </div >
        )
    }

    render_catogory_list_row(id: number, title: string, value: number, total: number) {
        if (this.state.add_expense_mode_category == id) {
            return this.render_add_single_category_expense();
        }
        return this.render_view_single_category(id, title, value, total);
    }

    render_categories() {
        return (
            <Card bordered={false} style={{ margin: 0, marginTop: 0, marginBottom: 10, padding: 0 }}>
                <Flex align="stretch" justify="space-around" vertical>
                    < Divider style={{ margin: 0, padding: 0 }} />
                    {this.state.user_data?.categoryList.map((category) => (
                        <div key={category.id}>
                            {this.render_catogory_list_row(category.id, category.name, this.state.filled_allocations[category.id], category.allocation)}
                            < Divider style={{ margin: 0, padding: 0 }} />
                        </div>
                    ))}

                </Flex>
            </Card>
        )
    }

    render_page() {
        return (
            <Flex vertical={GetScreenSize() != ScreenSize.desktop} justify={GetScreenSize() == ScreenSize.desktop ? "center" : "space-between"}>
                {this.header()}
                {this.render_categories()}
            </Flex >
        )
    }

    render() {
        if (this.state.user_data == null) {
            return <Flex vertical justify="center" align="center" style={{ height: "100vh" }}>
                <Spin size="large" indicator={<LoadingOutlined style={{ fontSize: 48 }} />} />
            </Flex>
        }
        return this.render_page();
    }

    constructor(props: any) {
        super(props);
        this._data_service = getDataService();
        this._recurring_calculator_service = new RecurringCalculatorService();
        this.state = {
            user_data: null,
            total_allocations: 0,
            filled_allocations: {},
            upcoming_expense: null,
        }
    }

    componentDidMount(): void {
        this._data_service.getUserData().then((data) => {
            this.setState({ user_data: data });
        });
    }

    componentDidUpdate(_prevProps: Readonly<IProp>, prevState: Readonly<IState>, _snapshot?: any): void {
        if (this.state.user_data != null && prevState.user_data?.last_updated != this.state.user_data.last_updated) {
            this.update_calculations();
            this.update_next_recurring();
        }
    }

    private update_next_recurring() {
        let recurring_list: Recurring[] = this.state.user_data!.recurringList;
        let next_dates_ = recurring_list.map((recurring) => (
            {
                "next_date": this._recurring_calculator_service.calculateNextDate(recurring),
                "data": recurring
            }
        )).sort((a, b) => a.next_date.getTime() - b.next_date.getTime());

        if (next_dates_.length > 0) {
            this.setState({
                upcoming_expense: {
                    name: next_dates_[0].data.name,
                    amount: next_dates_[0].data.amount
                }
            });
        }

    }
    private update_calculations() {
        let user_data = this.state.user_data;
        let total_allocations = 0;
        user_data?.categoryList.forEach((category) => {
            total_allocations += category.allocation;
        });
        let filled_allocations: { [key: string]: number; } = {}; // Add type annotation
        user_data?.categoryList.forEach((category) => {
            filled_allocations[category.id] = 0;
            category.expenseList.forEach((expense) => {
                filled_allocations[category.id] += expense.amount;
            });
        });
        this.setState({
            total_allocations: total_allocations,
            filled_allocations: filled_allocations
        });
    }
}

export default OverviewPage;