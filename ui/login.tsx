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

import React from 'react'
import ReactDOM from 'react-dom/client'

import './main.css'
import { Button, Card, Flex, Typography } from 'antd'
import { GithubOutlined, GoogleOutlined } from '@ant-design/icons'


class App extends React.Component {
    render(): React.ReactNode {
        return (
            <>
                <Flex vertical style={{ height: '100vh', width: '100vw', backgroundColor: '#fafafa' }} align='center' justify='center'>
                    <Card bordered style={{ width: 300 }} hoverable>
                        <Flex justify='center' align='center' vertical gap={20}>
                            <Typography.Title level={1}>BudgetBud</Typography.Title>
                            <Button type='primary'
                                style={{ backgroundColor: '#f5222d' }}
                                href='.auth/login/google?post_login_redirect_uri=/index.html'
                                size='large' block icon={<GoogleOutlined />}>
                                Login With Google
                            </Button>
                            <Button type='primary'
                                style={{ backgroundColor: '#262626' }}
                                href='.auth/login/github?post_login_redirect_uri=/index.html'
                                size='large' block icon={<GithubOutlined />}>
                                Login With Github
                            </Button>
                        </Flex>
                    </Card >
                </Flex>
            </>
        )
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
