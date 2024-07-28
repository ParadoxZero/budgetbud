import { FileOutlined, MoreOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, Flex, Input, InputRef, Select, Space, Typography } from "antd";
import React from "react";
import { connect } from "react-redux";

export interface HeaderBudgetDetails {
    name: string;
    id: string;
}

export interface HeaderProps {
    title: string;
    isVisible: boolean;
    budget_list: HeaderBudgetDetails[];
}

class Header extends React.Component<HeaderProps> {

    render() {
        return (
            <Flex justify="space-evenly" align="center" style={{ width: "100%", height: "100%" }}>
                {this.render_budget_selector()}
                <Button type="default" icon={<MoreOutlined />} size="large"></Button>
            </Flex>
        );
    }

    render_budget_selector() {
        const items = ["Budget 1", "Budget 2", "Budget 3"];

        let index = 0;

        const addItem = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
            e.preventDefault();
            // setItems([...items, name || `New item ${index++}`]);
            // setName('');
        };
        return (
            <Select
                size="large"
                style={{ width: 300 }}
                placeholder="Select Budget"
                dropdownRender={(menu) => (
                    <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Space style={{ padding: '0 8px 4px' }}>
                            <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
                                Add Budget
                            </Button>
                        </Space>
                    </>
                )}
                labelRender={(label) => (
                    <Flex justify="space-between" align="center" style={{ color: 'rgba(0, 0, 0, 0.25)' }}>
                        <Typography style={{ color: 'rgba(0, 0, 0, 0.25)' }}>{label.label}</Typography>
                        <Button type="text" style={{ color: 'rgba(0, 0, 0, 0.25)' }} icon={<SettingOutlined />} onClick={(e) => { e.stopPropagation() }} />
                    </Flex>
                )}
                variant="outlined"
                removeIcon={<FileOutlined />}
                options={items.map((item) => ({ label: item, value: item }))}
            />
        );
    }

}

function mapStateToProps(state: any): HeaderProps {
    return {
        budget_list: state.header.budget_list,
        title: state.header.title,
        isVisible: state.header.is_visible
    };
}

export default connect(mapStateToProps)(Header);