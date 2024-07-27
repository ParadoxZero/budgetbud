import { Card } from 'antd';
import React from 'react';
import { CreateBudgetForm } from '../components/create_budget_form';

export class NoBudgetAvailablePage extends React.Component {
    render() {
        return (
            <Card title="Create a Budgeet" hoverable>
                <CreateBudgetForm />
            </Card>
        );
    }
}

export default NoBudgetAvailablePage;