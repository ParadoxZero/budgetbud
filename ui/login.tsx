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
                                href='.auth/login/google'
                                size='large' block icon={<GoogleOutlined />}>
                                Login With Google
                            </Button>
                            <Button type='primary'
                                style={{ backgroundColor: '#262626' }}
                                href='.auth/login/github'
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
