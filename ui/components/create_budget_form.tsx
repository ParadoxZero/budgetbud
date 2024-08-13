/* 
 * BudgetBug - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2024  Sidhin S Thomas <sidhin.thomas@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 * The source is available at: https://github.com/ParadoxZero/budgetbud
 */

import { Button, Card, Empty, Form, FormInstance, FormProps, Input, InputNumber, Space, Spin, Typography } from "antd";
import React from "react";

import { DataService, getDataService } from "../services/data_service";
import { navigate, store, View } from "../store";
import { CloseCircleOutlined, CloseOutlined, CloseSquareFilled, LinkOutlined, LoadingOutlined, RightOutlined } from "@ant-design/icons";
import { Budget, Category, DataModelFactory } from "../datamodel/datamodel";
import { connect } from "react-redux";
import { LinkBudgetModal } from "./link_budget_modal";

export interface CreateBudgetFormProps {
    onFinish: (budget: Budget) => void;
    onCancel?: () => void;
}

export interface CreateBudgetFormState {
    is_link_modal_open: boolean;
}

class CreateBudgetForm extends React.Component<CreateBudgetFormProps, CreateBudgetFormState> {
    data_service: DataService;

    constructor(props: CreateBudgetFormProps) {
        super(props);
        this.data_service = getDataService();
        this.state = {
            is_link_modal_open: false
        };
    }

    render() {
        return (
            <>
                {this.render_create_budget()}
                <LinkBudgetModal isOpen={this.state.is_link_modal_open}
                    onClose={() => this.setState({ is_link_modal_open: false })}
                    onDone={() => store.dispatch(navigate(View.Overview))} />
            </>
        );
    }

    render_create_budget() {
        type FieldType = {
            name?: string;
            description?: string;
        };
        const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
            this.data_service.createBudget(values.name!).then((value: Budget) => {
                this.props.onFinish(value);
            }).catch((error) => {

            });
        };
        const render_cancel_button = () => {
            if (this.props.onCancel != null) {
                const onCancel = this.props.onCancel!;
                return (<Button type="link" onClick={() => onCancel()}>Cancel</Button>)
            }
            return (<></>);
        }
        return (
            <Form name="Create Budget"


                labelAlign="left"
                onFinish={onFinish}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                layout="vertical">
                <Form.Item<FieldType>
                    label="Please enter a name for the budget"
                    name="name"
                    rules={[{ required: true, message: "Please enter a name for the budget" }]}>
                    <Input />
                </Form.Item>
                <Form.Item<FieldType>
                    label="Add any notes or description for the budget"
                    name="description"
                    rules={[{ required: false }]}>
                    <Input.TextArea />
                </Form.Item>

                <Form.Item >
                    <Button type="primary" htmlType="submit" block>
                        Next
                    </Button>
                </Form.Item>
                <Form.Item >
                    <Button type="default" block icon={<LinkOutlined />} onClick={()=>{this.setState({is_link_modal_open:true})}}>
                        Add Existing Budget
                    </Button>
                </Form.Item>
                {render_cancel_button()}
            </Form >
        );
    }

}

export default CreateBudgetForm;