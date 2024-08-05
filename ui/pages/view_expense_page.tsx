import React, { Children } from "react";
import { Budget } from "../datamodel/datamodel";
import { budgetSlice, headerSlice, navigate, store, View } from "../store";
import { Button, Divider, Empty, Flex, Popconfirm, Select, Space, Statistic, Timeline, Typography } from "antd";
import { ClearOutlined, DeleteFilled, DeleteOutlined, EditFilled, LeftOutlined, MoreOutlined, PlusCircleFilled } from "@ant-design/icons";
import { connect } from "react-redux";
import { DataService, getDataService } from "../services/data_service";
import header from "../components/header";


export interface ViewExpensePageProps {
    budget: Budget;
    categoryId: number;
}

class ViewExpensePage extends React.Component<ViewExpensePageProps> {
    _data_service: DataService;

    constructor(props: ViewExpensePageProps) {
        super(props);
        this._data_service = getDataService();
    }

    componentDidMount(): void {
        let title = this.props.budget.categoryList.find((category) => category.id === this.props.categoryId)?.name;
        store.dispatch(headerSlice.actions.setTitle({ title: title, show_title: true }));
    }
    render() {
        return (
            <Flex vertical align="center" justify="center" style={{
                minWidth: 300
            }}>
                <Divider />
                {this.render_control_buttons()}
                <Divider />
                {this.render_body()}
            </ Flex>
        );
    }

    render_control_buttons() {
        const on_back_click = () => {
            store.dispatch(navigate(View.Overview));
        }

        return (
            <>
                <Flex align="center" justify="center" gap={10} wrap>
                    <Button shape="default" type="primary" icon={<LeftOutlined />} onClick={on_back_click} > Back </Button >
                    <Button shape="default" icon={<PlusCircleFilled />} disabled>Add new</Button >
                    <Button shape="default" icon={<ClearOutlined />} danger disabled> Clear All </Button >
                </Flex>
            </>
        )
    }

    render_body() {
        const expense_list = this.props.budget.categoryList.find((category) => category.id === this.props.categoryId)?.expenseList;
        if (!expense_list) {
            return (
                <Empty description="No expenses added yet." />
            )
        }

        const item_list = expense_list.map((expense) => {
            const date_string = (new Date(expense.timestamp)).toDateString();
            const on_delete_click = () => {
                this._data_service.deleteExpense(this.props.budget.id, this.props.categoryId, expense.id).then((budget) => {
                    store.dispatch(budgetSlice.actions.updateCurrent(budget));
                });
            }
            const ui = (
                <div>
                    <Flex align="stretch" justify="flex-start" gap={10} style={{ minWidth: 100 }} >
                        <Flex vertical>
                            <Typography.Text>{expense.title}</Typography.Text>
                            <Statistic title='Amount' value={expense.amount} suffix={expense.title} />
                        </Flex>
                        <Flex gap={5} justify="space-between" align="center">
                            <Popconfirm title="Are you sure?" okText="Yes" showArrow onConfirm={on_delete_click}>
                                <Button type="primary" size="small" icon={<DeleteFilled />} danger />
                            </Popconfirm>
                        </Flex>
                    </Flex>
                    <Divider />
                </div>
            );
            const label_ui = (
                <Flex vertical gap={5} style={{ minWidth: 10 }}>
                    <Typography.Text>On</Typography.Text>
                    <Typography.Text>{date_string}</Typography.Text>
                </Flex>
            )
            return {
                children: ui,
                label: label_ui
            }
        });

        return (
            <>
                <Timeline
                    mode="left"
                    items={item_list}
                    style={{ minWidth: 300 }}

                />
            </>
        )
    }
}

function mapStateToProps(state: any) {
    return {
        categoryId: state.navigation.selected_category_id,
    }
}


export default connect(mapStateToProps)(ViewExpensePage);