import { Button, Card, Empty, Form, FormInstance, FormProps, Input, InputNumber, Space, Spin, Typography } from "antd";
import React from "react";

import { DataService, getDataService } from "../services/data_service";
import { navigation, store, View } from "../store";
import { CloseCircleOutlined, CloseOutlined, CloseSquareFilled, LoadingOutlined } from "@ant-design/icons";
import { Budget, Category, DataModelFactory } from "../datamodel/datamodel";

enum WizardStep {
    CreateBudget,
    AddCategories,
    CreateReucrringExpenses,
}

interface CreateBudgetPageState {
    current_step: WizardStep;
    is_loading: boolean;
    budget: null | Budget;
}

export class CreateBudgetForm extends React.Component<{}, CreateBudgetPageState> {
    data_service: DataService;

    getTitle(): string {
        switch (this.state.current_step) {
            case WizardStep.CreateBudget:
                return "Create Budget";
            case WizardStep.AddCategories:
                return "Add Categories";
            case WizardStep.CreateReucrringExpenses:
                return "Create Recurring Expenses";
            default:
                return "Create Budget";
        }
    }

    constructor(props: {}) {
        super(props);
        this.data_service = getDataService();
        this.state = {
            current_step: WizardStep.CreateBudget,
            is_loading: false,
            budget: null,
        };
    }

    render() {
        return (
            <Card title={this.getTitle()} style={{}}>
                {this.render_form()}
            </Card>);
    }
    render_form(): React.ReactNode {
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
            this.data_service.createBudget(values.name!).then((value: Budget) => {
                this.setState({
                    is_loading: false,
                    current_step: WizardStep.AddCategories,
                    budget: value,
                });
            }).catch((error) => {

            });
        };
        return (
            <Form name="Create Budget"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 10 }}
                labelAlign="left"
                onFinish={onFinish}
                layout="vertical">
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

                <Form.Item >
                    <Button type="primary" htmlType="submit" block>
                        Create
                    </Button>
                </Form.Item>
            </Form >
        );
    }

    render_add_category() {
        const formRef = React.createRef<FormInstance>();
        const onFinish = (values: any) => {
            console.log(values);
            const category_list: Category[] = [];
            for (const raw_category of values.categories) {
                const category = DataModelFactory.createCategory(0);
                category.name = raw_category.name;
                category.allocation = raw_category.allocation;
                category_list.push(category);
            }
            this.setState({ is_loading: true });
            this.data_service.createCategories(this.state.budget!.id, category_list).then((value: Budget) => {
                this.setState({
                    is_loading: false,
                    current_step: WizardStep.CreateReucrringExpenses,
                    budget: value,
                });
                store.dispatch(navigation(View.Overview));
            }).catch((error) => {

            });
        };
        return (
            <Form
                name="add_categories"
                style={{ maxWidth: 600 }}
                autoComplete="off"
                initialValues={{ categories: [] }}
                ref={formRef}
                onFinish={onFinish}
            >
                <Form.List name="categories">
                    {(fields, { add, remove }) => (
                        <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column', justifyContent: 'center' }}>
                            {fields.map((field) => (
                                <Card
                                    size="small"
                                    key={field.key}
                                    actions={[<CloseOutlined onClick={() => remove(field.name)} />]}
                                >
                                    <Form.Item label="Name" name={[field.name, 'name']} rules={[{ required: true, message: "Name is required" }]}>
                                        <Input />
                                    </Form.Item>
                                    <Form.Item label="Allocated Amount" name={[field.name, 'allocation']} rules={[{ required: true, message: "Allocation is required" }]}>
                                        <InputNumber type="number" inputMode="numeric" />
                                    </Form.Item>
                                </Card>
                            ))}
                            {fields.length === 0 && (
                                <Empty description="No Categories Added" />
                            )}

                            <Button type="dashed" onClick={() => add()} block>
                                + Add Category
                            </Button>

                            <Button type="primary" htmlType="submit" block>
                                Finalize
                            </Button>
                        </div>
                    )}
                </Form.List>
            </Form>
        );
    }

    componentDidMount(): void {

    }

}