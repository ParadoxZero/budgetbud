import { Alert, Card, Flex } from 'antd';
import React from 'react';
import { CreateBudgetForm } from '../components/create_budget_form';

export class NoBudgetAvailablePage extends React.Component {
    render() {
        return (
            <>
                <Alert message="As of now, categories cannot be edited once added. So please configure your budget carefully." type="warning" />
                <CreateBudgetForm />
            </>
        );
    }
}

export default NoBudgetAvailablePage;