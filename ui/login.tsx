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
import { Button, Card, Flex, Spin, Typography } from 'antd'
import { GithubOutlined, GoogleOutlined, Loading3QuartersOutlined, LoadingOutlined } from '@ant-design/icons'


interface AppState {
    is_loading: boolean;
    show_buttons: boolean;
}
class App extends React.Component<{}, AppState> {
    constructor(props: {}) {
        super(props)
        this.state = {
            is_loading: true,
            show_buttons: false
        }
    }

    componentDidMount(): void {
        fetch('/.auth/me').then((response) => {
            if (response.ok) {
                window.location.href = '/index.html'
            } else {
                fetch('/.auth/refresh').then((response) => {
                    if (response.ok) {
                        window.location.href = '/index.html'
                    }
                    console.log(response);
                }).finally(() => {
                    this.setState({ is_loading: false })
                });
            }
        });

    }

    componentDidUpdate(prevProps: Readonly<{}>, prevState: Readonly<AppState>, snapshot?: any): void {

        if (!this.state.is_loading && prevState !== this.state) {
            const last_login_provider = localStorage.getItem('auth_provider');
            localStorage.clear();
            switch (last_login_provider) {
                case 'google':
                    window.location.href = '.auth/login/google?post_login_redirect_uri=/index.html&access_type=offline';
                    break;
                case 'github':
                    window.location.href = '.auth/login/github?post_login_redirect_uri=/index.html';
                    break;
                default:
                    console.log('No last login provider');
                    break;
            }
            this.setState({ show_buttons: true })
        }
    }

    renderCallToAction() {

        if (!this.state.show_buttons) {
            return (
                <Spin size='large' indicator={<LoadingOutlined />} />
            )
        } else {
            return (
                <>
                    <Button type='primary'
                        style={{ backgroundColor: '#f5222d' }}
                        href='.auth/login/google?post_login_redirect_uri=/index.html&access_type=offline'
                        size='large' block icon={<GoogleOutlined />}>
                        Login With Google
                    </Button>
                    <Button type='primary'
                        style={{ backgroundColor: '#262626' }}
                        href='.auth/login/github?post_login_redirect_uri=/index.html'
                        size='large' block icon={<GithubOutlined />}>
                        Login With Github
                    </Button>
                </>
            )
        }
    }
    render(): React.ReactNode {
        return (
            <>
                <Flex vertical style={{ height: '100vh', width: '100vw', backgroundColor: '#fafafa' }} align='center' justify='center'>
                    <Card bordered style={{ width: 300 }} hoverable>
                        <Flex justify='center' align='center' vertical gap={20}>
                            <Typography.Title level={1}>BudgetBud</Typography.Title>
                            {this.renderCallToAction()}
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
