import { Button, Card, Empty, Form, FormInstance, FormProps, Input, InputNumber, Space, Spin, Typography } from "antd";
import React from "react";

import { DataService, getDataService } from "../services/data_service";
import { navigate, store, View } from "../store";
import { CloseCircleOutlined, CloseOutlined, CloseSquareFilled, LoadingOutlined, RightOutlined } from "@ant-design/icons";
import { Budget, Category, DataModelFactory } from "../datamodel/datamodel";
import { connect } from "react-redux";

export interface CreateBudgetFormProps {
    onFinish: (budget: Budget) => void;
    onCancel?: () => void;
}

class CreateBudgetForm extends React.Component<CreateBudgetFormProps, {}> {
    data_service: DataService;

    constructor(props: CreateBudgetFormProps) {
        super(props);
        this.data_service = getDataService();
    }

    render() {
        return (
            <>
                {this.render_create_budget()}
            </>
        );
    }

    render_create_budget() {
        type FieldType = {
            name?: string;
            description?: string;
        };
        const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
            this.setState({ is_loading: true });
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
                {render_cancel_button()}
            </Form >
        );
    }

}

export default CreateBudgetForm;