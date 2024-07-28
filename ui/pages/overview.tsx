import React from "react";
import { Button, Card, Divider, Empty, Flex, Input, Progress, Spin, Statistic } from "antd";
import { CheckCircleOutlined, CloseOutlined, LoadingOutlined, PlusOutlined, RightOutlined, WalletOutlined } from '@ant-design/icons';
import { GetScreenSize, GetStatusFromPercent, ScreenSize, Status } from "../utils";
import { DataService, getDataService } from "../services/data_service";
import { DataModelFactory, Recurring, Budget } from "../datamodel/datamodel";
import { Typography } from "antd";
import { RecurringCalculatorService } from "../services/recurring_date_service";
import { BaseType } from "antd/es/typography/Base";
import { navigation, View, store, headerSlice } from '../store';

import '../main.css';
import { } from "react-redux";
import { TypeIcon } from "antd/es/message/PurePanel";

const { Text } = Typography;

interface IProp { }

interface AddExpenseContext {
    category_id: number;
    filled: boolean;
    processing: boolean;
}

interface IState {
    budget: Budget | null;
    total_allocations: number;
    filled_allocations: { [key: number]: number };
    upcoming_expense: { name: string, amount: number } | null;
    add_expense_mode_context: AddExpenseContext | null;

}

export class OverviewPage extends React.Component<IProp, IState> {

    _data_service: DataService;
    _recurring_calculator_service: RecurringCalculatorService;

    render_available_budget() {
        const used_up_budget = Object.values(this.state.filled_allocations).reduce((acc, curr) => acc += curr, 0);
        const percent = used_up_budget / this.state.total_allocations * 100;
        let status_color = '#3f8600';
        switch (GetStatusFromPercent(percent)) {
            case Status.error:
                status_color = '#ff4d4f';
                break;
            case Status.warning:
                status_color = 'ffa940';
                break;
        }
        return (
            <Card bordered={false} hoverable style={{ margin: 10 }} >
                <Statistic
                    title="Budget Used"
                    groupSeparator=""
                    value={used_up_budget}
                    precision={0}
                    // prefix={<CheckCircleOutlined />}
                    suffix={"/ " + (this.state.total_allocations).toString()}
                    valueStyle={{ color: status_color }}
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

        let context = this.state.add_expense_mode_context;

        const handle_add_expense = () => {
            const entered_amount = parseFloat((document.getElementById('expense_amount') as HTMLInputElement).value);
            if (entered_amount > 0) {
                const category_id = context!.category_id;
                const list_of_expenses = this.state.budget?.categoryList.find((category) => category.id == category_id)?.expenseList ?? [];
                const last_expense_id = list_of_expenses?.reduce((acc, curr) => Math.max(acc, curr.id), 0) ?? 0;
                const expense = DataModelFactory.createExpense(last_expense_id, context!.category_id, entered_amount);
                context!.processing = true;
                this.setState({ add_expense_mode_context: context });
                this._data_service.updateExpense(this.state.budget?.id!, expense).then((data) => {
                    // this.setState({ budget: data, add_expense_mode_context: null });
                });
            } else {
                this.setState({ add_expense_mode_context: null });
            }
        }

        const handle_input_change = () => {
            const entered_amount = parseFloat((document.getElementById('expense_amount') as HTMLInputElement).value);
            context!.filled = entered_amount > 0;
            this.setState({ add_expense_mode_context: context });
        }

        let feature_button_icon = <CloseOutlined />;
        if (context?.processing) {
            feature_button_icon = <LoadingOutlined />
        } else if (context?.filled) {
            feature_button_icon = <PlusOutlined />
        }

        return (
            <div style={{ margin: 0, marginTop: 10, marginBottom: 10, paddingRight: 20, paddingLeft: 20, minWidth: 300 }} className='touchahble'>
                <Flex align="center" justify="space-between" style={{ minHeight: 80 }}>
                    <Input id="expense_amount" size="large" type="number" placeholder="Spent amount"
                        autoFocus variant="borderless" minLength={250} inputMode="numeric"
                        style={{ padding: 0 }} onPressEnter={handle_add_expense}
                        onInput={handle_input_change} disabled={context?.processing} />
                    <Flex align="center" justify="right">
                        <Button shape="circle" type="default" icon={feature_button_icon} style={{ padding: 20, marginLeft: 20 }} onClick={() => { handle_add_expense() }}></Button>
                        <Button shape="circle" type="default" icon={<RightOutlined />} style={{ padding: 20, marginLeft: 20 }} onClick={(e) => { alert('button'); e.stopPropagation(); }} disabled></Button>
                    </Flex>
                </Flex>
            </div >
        )
    }

    render_view_single_category(id: number, title: string, value: number, total: number) {
        const percent = Math.floor((value / total) * 100);
        let progress_color = '#3f8600';
        let text_type: BaseType = "success";

        const status = GetStatusFromPercent(percent);
        switch (status) {
            case Status.error:
                progress_color = '#ff4d4f';
                text_type = "danger";
                break;
            case Status.warning:
                progress_color = '#ffa940';
                text_type = "warning";
                break;
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

        const on_click = () => {
            if (this.state.add_expense_mode_context == null) {
                this.setState({ add_expense_mode_context: { category_id: id, filled: false, processing: false } });
            }
        }

        return (
            <div style={{ margin: 0, marginTop: 10, marginBottom: 10, paddingRight: 20, paddingLeft: 20, minWidth: 300 }} className='touchahble' onClick={on_click}>
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
        if (this.state.add_expense_mode_context?.category_id == id) {
            return this.render_add_single_category_expense();
        }
        return this.render_view_single_category(id, title, value, total);
    }

    render_categories() {
        if (this.state.budget?.categoryList.length != 0) {

            return (
                <Card bordered={false} style={{ margin: 0, marginTop: 0, marginBottom: 10, padding: 0 }}>
                    <Flex align="stretch" justify="space-around" vertical>
                        < Divider style={{ margin: 0, padding: 0 }} />
                        {this.state.budget?.categoryList.map((category) => (
                            <div key={category.id}>
                                {this.render_catogory_list_row(category.id, category.name, this.state.filled_allocations[category.id], category.allocation)}
                                < Divider style={{ margin: 0, padding: 0 }} />
                            </div>
                        ))}

                    </Flex>
                </Card>
            )
        }
        return (
            <Card bordered={false} style={{ margin: 0, marginTop: 0, marginBottom: 10, padding: 0 }}>
                <Flex align="center" justify="center" style={{ height: 200 }}>
                    <Empty description="No budget details" imageStyle={{ height: "auto", fontSize: 48 }} />
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
        if (this.state.budget == null) {
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
            budget: null,
            total_allocations: 0,
            filled_allocations: {},
            upcoming_expense: null,
            add_expense_mode_context: null
        }
    }

    componentDidMount(): void {
        this._data_service.getBudget("").then((data) => {
            if (data.length > 0) {
                this.setState({ budget: data[0] });
                store.dispatch(
                    headerSlice.actions.header(
                        {
                            budget_list: data,
                            is_visible: true,
                        })

                );
            }
            else {
                this.navigate_to(View.NoBudgetAvailable);
            }
        });
    }

    componentDidUpdate(_prevProps: Readonly<IProp>, prevState: Readonly<IState>, _snapshot?: any): void {
        if (this.state.budget != null && prevState.budget?.last_updated != this.state.budget.last_updated) {
            this.update_calculations();
            this.update_next_recurring();
        }
    }

    private navigate_to(view: View) {
        store.dispatch(navigation(view));
    }

    private update_next_recurring() {
        const recurring_list: Recurring[] = this.state.budget!.recurringList;
        const next_dates_ = recurring_list.map((recurring) => (
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
        const budget = this.state.budget;
        let total_allocations = 0;
        budget?.categoryList.forEach((category) => {
            total_allocations += category.allocation;
        });
        const filled_allocations: { [key: string]: number; } = {}; // Add type annotation
        budget?.categoryList.forEach((category) => {
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