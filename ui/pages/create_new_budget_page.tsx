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

import { Alert, Card, Flex, Spin } from 'antd';
import React from 'react';
import CreateBudgetForm from '../components/create_budget_form';
import { Budget } from '../datamodel/datamodel';
import { LoadingOutlined } from '@ant-design/icons';
import { AddCategoriesForm } from '../components/add_categories_form';
import { navigate, store, View } from '../store';

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
    is_other_budget_available: boolean;
}
export class CreateNewBudgetPage extends React.Component<CreateBudgetPageProps, CreateBudgetPageState> {
    render() {
        return (
            <Flex style={{ width: '100vw', height: '100vh' }} vertical align='center' justify='center'>
                <Card title={this.getTitle()}>
                    {this.render_form()}
                </Card>
            </Flex>
        );
    }

    render_form(): React.ReactNode {
        if (this.state.is_loading) {
            return (<Spin indicator={<LoadingOutlined spin />} size="large" />);
        }

        switch (this.state.current_step) {
            case WizardStep.CreateBudget:
                return (<CreateBudgetForm
                    onCancel={this.props.is_other_budget_available ? () => { store.dispatch(navigate(View.Overview)) } : undefined}
                    onFinish={(budget: Budget) => { this.setState({ current_step: WizardStep.AddCategories, budget_under_edit: budget }) }} />);
            case WizardStep.AddCategories:
                return (< AddCategoriesForm budget_id={this.state.budget_under_edit!.id} onCategoriesAdded={function (): void {
                    store.dispatch(navigate(View.Overview));
                }} onCancel={function (): void {
                    store.dispatch(navigate(View.Overview));
                }} />);

            default:
                return (<></>);
        }
    }
    getTitle(): string {
        switch (this.state.current_step) {
            case WizardStep.CreateBudget:
                return "Create a new Budget";
            case WizardStep.AddCategories:
                return "Allocate Money to Categories";
            case WizardStep.CreateReucrringExpenses:
                return "Add Recurring Expenses";
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