import { Button, Card, Flex, Form, FormProps, Input, Typography } from "antd";
import React from "react";

import { DataService, getDataService } from "../services/data_service";
import { navigation, store, View } from "../store";

const { Text } = Typography;

interface CreateBudgetPageState {

}

type FieldType = {
    name?: string;
    description?: string;
};

export class CreateBudgetPage extends React.Component<{}, CreateBudgetPageState> {
    data_service: DataService;

    constructor(props: {}) {
        super(props);
        this.data_service = getDataService();
    }

    render(): React.ReactNode {
        const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
            console.log('Success:', values);
            this.data_service.createBudget(values.name!).then(() => { store.dispatch(navigation(View.Overview)) });
        };
        return (
            <Card title="Create new Budget" style={{}}>
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
            </Card>
        );
    }

    componentDidMount(): void {

    }

}