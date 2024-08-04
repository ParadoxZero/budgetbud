import React from "react";
import { connect } from "react-redux";
import { Budget } from "../datamodel/datamodel";
import { budgetSlice, navigation, store, View } from "../store";
import { Button, Card, Divider, Flex, Input, Popconfirm, Typography } from "antd";
import { BackwardFilled, CheckOutlined, CloseOutlined, DeleteFilled, SendOutlined, UpOutlined } from "@ant-design/icons";
import { DataService, getDataService } from "../services/data_service";



export interface EditCategoriesPageProps {
    budget: Budget;
}

interface EditCategoriesPageState {

}

class EditCategoriesPage extends React.Component<EditCategoriesPageProps, EditCategoriesPageState> {
    _data_service: DataService;

    constructor(props: EditCategoriesPageProps) {
        super(props);
        this._data_service = getDataService();
    }

    render() {
        return (
            <Flex vertical align="center" justify="center">
                {this.render_control_buttons()}
                {this.render_categories()}
            </Flex>
        );
    }

    render_categories() {
        return (
            <Card bordered={false} style={{ maxWidth: 600 }}>
                <Flex justify="space-between" vertical>
                    < Divider />
                    {this.props.budget.categoryList.map((category) => (
                        <div key={category.id}>
                            {this.render_catogory_list_row(category.id, category.name, category.allocation)}
                            < Divider />
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
            <Flex align="center" justify="center">
                <Button shape="default" type="primary" icon={<CloseOutlined />} style={{ padding: 20, marginLeft: 20 }} onClick={on_back_click}> Cancel </Button >
                <Button danger shape="default" type="primary" icon={<DeleteFilled />} style={{ padding: 20, marginLeft: 20 }}> Delete Budget</Button>
            </Flex>
        )
    }

    render_catogory_list_row(id: number, title: string, allocation: number) {
        const delete_title = "Delete '" + title + "' category";
        const delete_question = "Are you sure to delete the category - " + title + "? All data will be lost.";
        const on_delete_click = () => {
            this._data_service.deleteCategory(this.props.budget.id, id)
                .then((budget: Budget) => { store.dispatch(budgetSlice.actions.updateCurrent(budget)); });
        }
        return (
            <div style={{ margin: 0, marginTop: 10, marginBottom: 10, paddingRight: 20, paddingLeft: 20, minWidth: 300 }}>
                <Flex align="center" justify="center" gap={10}>
                    <Input size="middle" defaultValue={title} style={{ minWidth: 150, maxWidth: 350 }}></Input>
                    <Input size="middle" defaultValue={allocation} style={{ minWidth: 50, maxWidth: 100 }}></Input>
                    <Button shape="circle" type="primary" icon={<CheckOutlined />} onClick={(e) => { alert('button'); e.stopPropagation(); }}></Button>

                    <Popconfirm
                        title={delete_title}
                        description={delete_question}
                        onConfirm={on_delete_click}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger shape="circle" type="primary" icon={<DeleteFilled />}></Button>
                    </Popconfirm>
                </Flex>
            </div >
        )
    }
}

export default EditCategoriesPage;