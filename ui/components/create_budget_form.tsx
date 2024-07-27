import { Button, Card, Form, FormProps, Input, Spin } from "antd";
import React from "react";

import { DataService, getDataService } from "../services/data_service";
import { navigation, store, View } from "../store";
import { LoadingOutlined } from "@ant-design/icons";

enum WizardStep {
    CreateBudget,
    AddCategories,
    CreateReucrringExpenses,
}

interface CreateBudgetPageState {
    current_step: WizardStep;
    is_loading: boolean;
}

export class CreateBudgetForm extends React.Component<{}, CreateBudgetPageState> {
    data_service: DataService;

    constructor(props: {}) {
        super(props);
        this.data_service = getDataService();
        this.state = {
            current_step: WizardStep.CreateBudget,
            is_loading: false,
        };
    }

    render(): React.ReactNode {
        if (this.state.is_loading) {
            return (<Spin indicator={<LoadingOutlined spin />} size="large" />);
        }
        switch (this.state.current_step) {
            case WizardStep.CreateBudget:
                return this.render_create_budget();
            case WizardStep.AddCategories:
                return this.render_add_category();
            case WizardStep.CreateReucrringExpenses:
                return this.render_add_category();
            default:
                return (<></>);
        }
    }

    render_create_budget() {
        type FieldType = {
            name?: string;
            description?: string;
        };
        const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
            this.setState({ is_loading: true });
            this.data_service.createBudget(values.name!).then(() => {
                this.setState({
                    is_loading: false,
                    current_step: WizardStep.AddCategories
                });
            });
        };
        return (
            <Form name="Create Budget"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                labelAlign="left"
                onFinish={onFinish}>
                <Form.Item<FieldType>
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: "Please enter name for budget" }]}>
                    <Input />
                </Form.Item>
                <Form.Item<FieldType>
                    label="Description"
                    name="description"
                    rules={[{ required: false }]}> <Input.TextArea /> </Form.Item>

                <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                    <Button type="primary" htmlType="submit">
                        Add Category
                    </Button>
                </Form.Item>
            </Form >
        );
    }

    render_add_category() {
        return (
            <Form>

            </Form>
        );
    }

    componentDidMount(): void {

    }

}