import { Card, Divider, Flex, Progress, Space, Statistic } from "antd"
import { CheckCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { GetScreenSize, ScreenSize } from "../utils";


function render_available_budget() {
    return (
        <Card bordered={false} style={{ margin: 10 }} >
            <Statistic
                title="Budget used"
                value={150056 / 100}
                precision={2}
                prefix={<CheckCircleOutlined />}
                suffix="/ 45000"
                valueStyle={{ color: '#3f8600' }}
            />
        </Card>
    )
}

function render_upcoming() {
    return (
        <Card bordered={false} style={{ margin: 10 }}>
            <Statistic
                title="Upcoming expenses"
                value={1500}
                precision={0}
                prefix={<PlusCircleOutlined />}
                suffix="Car Wash"
            // valueStyle={{ color: '#3f8600' }}
            />
        </Card>
    )
}

function header() {
    return (
        <Flex vertical={GetScreenSize() == ScreenSize.desktop}>
            {render_available_budget()}
            {render_upcoming()}
        </Flex>
    )
}

function render_single_category(title: string, value: number, total: number) {
    var progress = null;
    if (GetScreenSize() == ScreenSize.desktop) {
        progress = <Progress type="line" percent={(value / total) * 100} strokeColor={'#1677ff'} style={{ marginBottom: 14 }} />
    }
    return (
        <div style={{ margin: 0, marginTop: 0, marginBottom: 0, padding: 0, minWidth: 300 }}>
            <Flex align="center" justify="space-between">
                <p style={{ margin: 10 }}>{title}</p>
                <Flex align="center" justify="center" vertical>
                    <p>${value}/${total}</p>
                    {progress}
                </Flex>
            </Flex>
        </div >
    )
}

function render_categories() {
    return (
        <Card bordered={false} style={{ margin: 0, marginTop: 10, marginBottom: 10, padding: 0 }}>
            <Flex align="stretch" justify="space-around" vertical>
                {render_single_category("Groceries", 2000, 4000)}
                <Divider style={{ margin: 0, padding: 0 }} />
                {render_single_category("Car Wash", 0, 4000)}
                <Divider style={{ margin: 0, padding: 0 }} />
                {render_single_category("Car Insurance", 0, 4000)}
                <Divider style={{ margin: 0, padding: 0 }} />
                {render_single_category("Gas", 150, 4000)}
                <Divider style={{ margin: 0, padding: 0 }} />
                {render_single_category("Other", 0, 4000)}
            </Flex>
        </Card>
    )
}

export function OverviewPage() {
    return (
        <Flex vertical={GetScreenSize() != ScreenSize.desktop}>
            {header()}
            {render_categories()}
        </Flex >
    )
}