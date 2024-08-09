import { EditFilled, FileOutlined, LogoutOutlined, MoreOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, Dropdown, Flex, Input, InputRef, MenuProps, Select, Space, Typography } from "antd";
import React from "react";
import { connect } from "react-redux";
import { budgetSlice, headerSlice, navigate, store, View } from "../store";
import { GetScreenSize, ScreenSize } from "../utils";

export interface HeaderBudgetDetails {
    name: string;
    id: string;
}

export interface HeaderProps {
    title: string;
    isVisible: boolean;
    budget_list: HeaderBudgetDetails[];
    selected_budget_index: number | null;
    show_title: boolean;
}

interface HeaderState {
    is_budget_selector_visible: boolean;
}

class Header extends React.Component<HeaderProps, HeaderState> {

    render() {
        if (this.props.show_title) {
            return (
                <Flex justify="center" align="center" style={{ width: "100%", height: "100%" }}>
                    <Typography.Title level={2}>{this.props.title}</Typography.Title>
                </Flex>
            )
        }

        let justify = "space-between";
        if (GetScreenSize() != ScreenSize.mobile) {
            justify = "center";
        }
        return (
            <Flex justify={justify} align="center" style={{ width: "100%", height: "100%" }} gap="small">
                {this.render_budget_selector()}
                <Button type="default" icon={<SettingOutlined />} size="large" onClick={() => { store.dispatch(navigate(View.CategoryEdit)) }}></Button>
                {this.render_more_menu()}
            </Flex>
        );
    }

    constructor(props: HeaderProps) {
        super(props);
        this.state = {
            is_budget_selector_visible: false,
        };
    }

    render_budget_selector() {
        const items = this.props.budget_list.map((budget, index) => ({ name: budget.name, value: index }));
        if (items.length == 0) {
            return (
                <Input
                    size="large"
                    placeholder="Create Budget"
                    prefix={<Avatar icon={<FileOutlined />} />}
                    suffix={<Button type="default" icon={<PlusOutlined />} />}
                />
            );
        }
        let defaultValue: number = this.props.selected_budget_index ?? 0;
        const addItem = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
            this.setState({ is_budget_selector_visible: false });
            e.preventDefault();
            store.dispatch(headerSlice.actions.header({ is_visible: false }));
            store.dispatch(budgetSlice.actions.updateSelection({ index: null }));
            store.dispatch(navigate(View.NoBudgetAvailable));
        };
        const onSelectionChanged = (value: number) => {
            store.dispatch(budgetSlice.actions.updateSelection({ index: value }));
        }
        const onSettingsClicked = () => {
            this.setState({ is_budget_selector_visible: false });
            store.dispatch(navigate(View.NoBudgetAvailable));
        }

        return (
            <Select
                size="large"
                style={{ width: 300 }}
                placeholder="Select Budget"
                options={items.map((item) => ({ label: item.name, value: item.value }))}
                defaultValue={defaultValue}
                onChange={onSelectionChanged}
                onDropdownVisibleChange={(visible) => { this.setState({ is_budget_selector_visible: visible }) }}
                open={this.state.is_budget_selector_visible}
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
                    </Flex>
                )}
                variant="outlined"
            />
        );
    }

    render_more_menu() {
        const items: MenuProps['items'] = [
            {
                label: 'Sign Out',
                key: '1',
                icon: <LogoutOutlined />,
                onClick: () => { window.location.href = "/.auth/logout" },
            },
        ];
        return (
            <Dropdown menu={{ items }}>

                <Button type="default" icon={< MoreOutlined />} size="large" ></Button>
            </Dropdown>
        );
    }

}

function mapStateToProps(state: any): HeaderProps {
    return {
        budget_list: state.budget.budget_list,
        selected_budget_index: state.budget.selected_budget_index,
        title: state.header.title,
        isVisible: state.header.is_visible,
        show_title: state.header.show_title,
    };
}

export default connect(mapStateToProps)(Header);