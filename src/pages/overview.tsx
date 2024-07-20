import React, { useState } from "react";
import { Button, Card, Divider, Empty, Flex, Progress, ProgressProps, Skeleton, Space, Spin, Statistic } from "antd";
import { CheckCircleOutlined, LoadingOutlined, PlusCircleOutlined, RightCircleOutlined, RightOutlined, SmileOutlined } from '@ant-design/icons';
import { GetScreenSize, ScreenSize } from "../utils";
import { DataService, getDataService } from "../services/data_service";
import { UserData } from "../datamodel/datamodel";
import { Typography } from "antd";

const { Title, Text } = Typography;

interface IProp { }
interface IState {
    user_data: UserData | null;
    total_allocations: number;
    filled_allocations: { [key: number]: number };
    upcoming_expense: { name: string, amount: number } | null;
}

export class OverviewPage extends React.Component<IProp, IState> {

    _data_service: DataService;
    render_available_budget() {
        return (
            <Card bordered={false} style={{ margin: 10 }} >
                <Statistic
                    title="Budget used"
                    groupSeparator=""
                    value={Object.values(this.state.filled_allocations).reduce((acc, curr) => acc += curr, 0)}
                    precision={0}
                    prefix={<CheckCircleOutlined />}
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
                title="Upcoming expenses"
                value={this.state.upcoming_expense.amount}
                precision={2}
                prefix={<PlusCircleOutlined />}
                suffix={this.state.upcoming_expense.name}
            />;
        }
        return (
            <Card bordered={false} style={{ margin: 10 }}>
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

    render_single_category(title: string, value: number, total: number) {
        let progress_color = '#3f8600';
        const percent = Math.floor((value / total) * 100);
        if (percent > 85) {
            progress_color = '#ff4d4f';
        }
        else if (percent > 60) {
            progress_color = '#ffa940';
        }

        var progress = <Progress
            type="line"
            percent={percent}
            strokeColor={progress_color}
            style={{
                marginBottom: 14,
                minWidth: 100
            }}
            status={"active"}
        />

        return (
            <div style={{ margin: 0, marginTop: 10, marginBottom: 10, padding: 0, minWidth: 300 }}>
                <Flex align="center" justify="space-between">
                    <Text code strong type="secondary" style={{ fontSize: 18 }}>{title}</Text>
                    <Flex align="center" justify="right">
                        <Flex align="flex-end" justify="center" vertical>
                            <Text >{value} / {total}</Text>
                            {progress}
                        </Flex>
                        <Button shape="circle" type="default" icon={<RightOutlined />} style={{ padding: 20, marginLeft: 20 }}></Button>
                    </Flex>
                </Flex>
            </div >
        )
    }

    render_categories() {
        return (
            <Card bordered={false} style={{ margin: 0, marginTop: 10, marginBottom: 10, padding: 0 }}>
                <Flex align="stretch" justify="space-around" vertical>
                    {this.state.user_data?.categoryList.map((category) => (
                        <div key={category.id}>
                            {this.render_single_category(category.name, this.state.filled_allocations[category.id], category.allocation)}
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