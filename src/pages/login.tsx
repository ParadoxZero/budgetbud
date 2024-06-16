import { Button, Card, Flex, Input } from "antd";

import { GetScreenSize, ScreenSize } from "../utils";
import { GoogleOutlined, GithubOutlined, InstagramOutlined, LinkOutlined } from "@ant-design/icons";

function Socials() {
    return (
        <Flex gap={5} align="center" justify="space-evenly" dir="row">
            <GoogleOutlined />
            <GithubOutlined />
            <InstagramOutlined />
            <LinkOutlined />
        </Flex>
    )
}

function LoginForm() {
    return (
        <Card bordered={GetScreenSize() == ScreenSize.desktop}>
            <Flex gap={10} align="center" vertical>
                <Input placeholder="Username" />
                <Input placeholder="Password" type="password" />
                <Button type="primary">Login</Button>
                <Button type="link">Forgot Password?</Button>
                <p> No account yet? <Button type="link" style={{ padding: 0 }}>Register now</Button></p>
                <Socials />
            </Flex>
        </Card>
    )
}

export function LoginPage() {
    return (
        <Flex align="center" justify="space-around" vertical >
            <LoginForm />
        </Flex>
    )
}