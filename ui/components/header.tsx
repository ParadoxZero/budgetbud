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
            <Flex justify="space-between" align="center" style={{ width: "100%", height: "100%" }}>
                {this.render_budget_selector()}
                <Button type="default" icon={<MoreOutlined />} size="large"></Button>
            </Flex>
        );
    }

    render_budget_selector() {
        const items = this.props.budget_list;

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
                                Add item
                            </Button>
                        </Space>
                    </>
                )}
                options={items.map((item) => ({ label: item.name, value: item.id }))}
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