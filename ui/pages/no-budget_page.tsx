import { Card, Flex } from 'antd';
import React from 'react';
import { CreateBudgetForm } from '../components/create_budget_form';

export class NoBudgetAvailablePage extends React.Component {
    render() {
        return (
            <CreateBudgetForm />
        );
    }
}

export default NoBudgetAvailablePage;