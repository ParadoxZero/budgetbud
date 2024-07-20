import React, { useState } from "react";
import { Button, Card, Divider, Empty, Flex, Progress, Skeleton, Space, Spin, Statistic } from "antd";
import { CheckCircleOutlined, LoadingOutlined, PlusCircleOutlined, RightCircleOutlined, RightOutlined } from '@ant-design/icons';
import { GetScreenSize, ScreenSize } from "../utils";
import { DataService, getDataService } from "../services/data_service";
import { UserData } from "../datamodel/datamodel";

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
                    value={Object.values(this.state.filled_allocations).reduce((acc, curr) => acc += curr, 0) / 100}
                    precision={2}
                    prefix={<CheckCircleOutlined />}
                    suffix={"/ " + (this.state.total_allocations / 100).toString()}
                    valueStyle={{ color: '#3f8600' }}
                />
            </Card>
        )
    }

    render_upcoming() {
        let content = <Empty description="No upcoming expense" />;
        if (this.state.upcoming_expense != null) {
            content = <Statistic
                title="Upcoming expenses"
                value={this.state.upcoming_expense.amount / 100}
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
        var progress = null;
        progress = <Progress type="line" percent={(value / total) * 100} strokeColor={'#1677ff'} style={{ marginBottom: 14 }} />
        return (
            <div style={{ margin: 0, marginTop: 0, marginBottom: 0, padding: 0, minWidth: 300 }}>
                <Flex align="center" justify="space-between">
                    <p style={{ margin: 10 }}>{title}</p>
                    <Flex align="center" justify="right">
                        <Flex align="center" justify="center" vertical>
                            <p>${value}/${total}</p>
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
                    {this.render_single_category("Groceries", 2000, 4000)}
                    <Divider style={{ margin: 0, padding: 0 }} />
                    {this.render_single_category("Car Wash", 0, 4000)}
                    <Divider style={{ margin: 0, padding: 0 }} />
                    {this.render_single_category("Car Insurance", 0, 4000)}
                    <Divider style={{ margin: 0, padding: 0 }} />
                    {this.render_single_category("Gas", 150, 4000)}
                    <Divider style={{ margin: 0, padding: 0 }} />
                    {this.render_single_category("Other", 0, 4000)}
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
                filled_allocations[category.name] += expense.amount;
            });
        });
        this.setState({
            total_allocations: total_allocations,
            filled_allocations: filled_allocations
        });
    }
}

export default OverviewPage;