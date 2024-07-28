import { Button, Card, Empty, Form, FormInstance, FormProps, Input, InputNumber, Space, Spin, Typography } from "antd";
import React from "react";

import { DataService, getDataService } from "../services/data_service";
import { navigation, store, View } from "../store";
import { CloseCircleOutlined, CloseOutlined, CloseSquareFilled, LoadingOutlined, RightOutlined } from "@ant-design/icons";
import { Budget, Category, DataModelFactory } from "../datamodel/datamodel";
import { connect } from "react-redux";

enum WizardStep {
    CreateBudget,
    AddCategories,
    CreateReucrringExpenses,
}

interface CreateBudgetPageState {
    current_step: WizardStep;
    is_loading: boolean;
    budget_under_edit: null | Budget;
}

interface CreateBudgetPageProps {
    budget: Budget;
}

class CreateBudgetForm extends React.Component<CreateBudgetPageProps, CreateBudgetPageState> {
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

    constructor(props: CreateBudgetPageProps) {
        super(props);
        this.data_service = getDataService();
        this.state = {
            current_step: WizardStep.CreateBudget,
            is_loading: false,
            budget_under_edit: null,
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
                    budget_under_edit: value,
                });
            }).catch((error) => {

            });
        };
        const render_cancel_button = () => {
            if (this.props.budget != null) {
                return (<Button type="link" onClick={() => store.dispatch(navigation(View.Overview))}>Cancel</Button>)
            }
            return (<></>);
        }
        return (
            <Form name="Create Budget"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 10 }}
                labelAlign="left"
                onFinish={onFinish}
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                layout="vertical">
                <Form.Item<FieldType>
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: "Please enter a name for the budget" }]}>
                    <Input />
                </Form.Item>
                <Form.Item<FieldType>
                    label="Description"
                    name="description"
                    rules={[{ required: false }]}> <Input.TextArea /> </Form.Item>

                <Form.Item >
                    <Button type="primary" htmlType="submit" block>
                        Next
                    </Button>
                </Form.Item>
                {render_cancel_button()}
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
            this.data_service.createCategories(this.state.budget_under_edit!.id, category_list).then((value: Budget) => {
                this.setState({
                    is_loading: false,
                    current_step: WizardStep.CreateReucrringExpenses,
                    budget_under_edit: value,
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
                            <Button type="link" onClick={() => store.dispatch(navigation(View.Overview))}>Cancel</Button>
                        </div>
                    )}
                </Form.List>
            </Form>
        );
    }

    componentDidUpdate(prevProps: Readonly<CreateBudgetPageProps>, prevState: Readonly<CreateBudgetPageState>, snapshot?: any): void {
        if (prevProps.budget == null && this.props.budget != null) {
            this.setState({
                current_step: WizardStep.AddCategories,
                budget_under_edit: this.props.budget,
            });
        }
    }

}

function mapStateToProps(state: any) {
    const index = state.budget.selected_budget_index;
    if (index == null) {
        return {
            budget: null,
        };
    } else {
        return {
            budget: state.budget.budget_list[index],
        };
    }
}

export default connect(mapStateToProps)(CreateBudgetForm);