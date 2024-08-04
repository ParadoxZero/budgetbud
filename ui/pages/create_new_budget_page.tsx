import { Alert, Card, Flex, Spin } from 'antd';
import React from 'react';
import CreateBudgetForm from '../components/create_budget_form';
import { Budget } from '../datamodel/datamodel';
import { LoadingOutlined } from '@ant-design/icons';
import { AddCategoriesForm } from '../components/add_categories_form';
import { navigation, store, View } from '../store';

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
export interface CreateBudgetPageProps {
}
export class CreateNewBudgetPage extends React.Component<CreateBudgetPageProps, CreateBudgetPageState> {
    render() {
        return (
            <Card title={this.getTitle()} >
                <Alert message="As of now, categories cannot be edited once added. So please configure your budget carefully." type="warning" />
                {this.render_form()}
            </Card>
        );
    }

    render_form(): React.ReactNode {
        if (this.state.is_loading) {
            return (<Spin indicator={<LoadingOutlined spin />} size="large" />);
        }
        switch (this.state.current_step) {
            case WizardStep.CreateBudget:
                return (<CreateBudgetForm onFinish={(budget: Budget) => { this.setState({ current_step: WizardStep.AddCategories, budget_under_edit: budget }) }} />);
            case WizardStep.AddCategories:
                return (< AddCategoriesForm budget_id={this.state.budget_under_edit!.id} onCategoriesAdded={function (): void {
                    store.dispatch(navigation(View.Overview));
                }} onCancel={function (): void {
                    store.dispatch(navigation(View.Overview));
                }} />);

            default:
                return (<></>);
        }
    }
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
        this.state = {
            current_step: WizardStep.CreateBudget,
            is_loading: false,
            budget_under_edit: null
        };
    }
}

export default CreateNewBudgetPage;