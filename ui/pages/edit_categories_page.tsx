import React from "react";
import { connect } from "react-redux";
import { Budget, DataModelFactory } from "../datamodel/datamodel";
import { budgetSlice, navigation, store, View } from "../store";
import { Button, Card, Divider, Flex, Input, Popconfirm, Typography } from "antd";
import { BackwardFilled, CheckOutlined, CloseOutlined, DeleteFilled, LeftOutlined, SendOutlined, UpOutlined } from "@ant-design/icons";
import { DataService, getDataService } from "../services/data_service";



export interface EditCategoriesPageProps {
    budget: Budget;
}

interface EditCategoriesPageState {
    is_loading: boolean;
}

class EditCategoriesPage extends React.Component<EditCategoriesPageProps, EditCategoriesPageState> {
    _data_service: DataService;

    constructor(props: EditCategoriesPageProps) {
        super(props);
        this._data_service = getDataService();
        this.state = {
            is_loading: false,
        };
    }

    render() {
        return (
            <Flex vertical align="center" justify="center" style={{ marginTop: 20 }}>
                {this.render_control_buttons()}
                {this.render_categories()}
            </Flex>
        );
    }

    render_categories() {
        return (
            <Card bordered={false} style={{ maxWidth: 600 }}>
                <Flex justify="space-between" vertical>
                    {this.props.budget.categoryList.map((category) => (
                        <div key={category.id}>
                            {this.render_catogory_list_row(category.id, category.name, category.allocation)}
                        </div>
                    ))}
                </Flex>
            </Card >
        );
    }

    render_control_buttons() {
        const on_back_click = () => {
            store.dispatch(navigation(View.Overview));
        }
        return (
            <Flex align="center" justify="center" gap={10}>
                <Button shape="default" type="primary" icon={<LeftOutlined />} onClick={on_back_click} disabled={this.state.is_loading}> Back </Button >
                <Popconfirm
                    title="Delete Budget"
                    description="Are you sure to delete the budget? All data will be lost."
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => {
                        this.setState({ is_loading: true }); this._data_service.deleteBudget(this.props.budget.id)
                            .then(() => store.dispatch(navigation(View.Overview)))
                            .finally(() => { this.setState({ is_loading: false }); })
                    }}
                >
                    <Button danger shape="default" type="primary" icon={<DeleteFilled />} disabled={this.state.is_loading}> Delete Budget</Button>
                </Popconfirm>
            </Flex>
        )
    }

    render_catogory_list_row(id: number, title: string, allocation: number) {
        const delete_title = "Delete '" + title + "' category";
        const delete_question = "Are you sure to delete the category - " + title + "? All data will be lost.";

        let updated_title = title;
        let updated_allocation = allocation;

        const on_delete_click = () => {
            this._data_service.deleteCategory(this.props.budget.id, id)
                .then((budget: Budget) => store.dispatch(budgetSlice.actions.updateCurrent(budget)))
                .finally(() => { this.setState({ is_loading: false }); });
        }
        const on_title_change = (e: React.ChangeEvent<HTMLInputElement>) => {
            updated_title = e.target.value;
        }
        const on_allocation_change = (e: React.ChangeEvent<HTMLInputElement>) => {
            updated_allocation = parseInt(e.target.value);
        }
        const on_edit_click = () => {
            let category = DataModelFactory.createCategory(0);
            category.name = updated_title;
            category.allocation = updated_allocation;
            category.id = id;
            this.setState({ is_loading: true });
            this._data_service.updateCategory(this.props.budget.id, category)
                .then((budget: Budget) => store.dispatch(budgetSlice.actions.updateCurrent(budget)))
                .finally(() => this.setState({ is_loading: false }));
        }
        return (
            <div style={{ margin: 0, marginTop: 10, marginBottom: 10, paddingRight: 20, paddingLeft: 20, minWidth: 300 }}>
                <Flex align="center" justify="center" gap={10}>
                    <Input size="middle" defaultValue={title} style={{ minWidth: 150, maxWidth: 350 }} onChange={on_title_change}></Input>
                    <Input size="middle" defaultValue={allocation} style={{ minWidth: 50, maxWidth: 100 }} onChange={on_allocation_change}></Input>
                    <Button shape="circle" type="primary" icon={<CheckOutlined />} onClick={on_edit_click} disabled={this.state.is_loading}></Button>

                    <Popconfirm
                        title={delete_title}
                        description={delete_question}
                        onConfirm={on_delete_click}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger shape="circle" type="primary" icon={<DeleteFilled />} disabled={this.state.is_loading}></Button>
                    </Popconfirm>
                </Flex>
            </div >
        )
    }
}

export default EditCategoriesPage;