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

import { ArrowUpOutlined, CalendarOutlined, FileOutlined, LineChartOutlined, LinkOutlined, LogoutOutlined, MoreOutlined, PlusOutlined, SettingOutlined, UpOutlined, UpSquareFilled } from "@ant-design/icons";
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
                            <Flex gap={10}>
                                <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
                                    Add Budget
                                </Button>
                                <Button type="text" icon={<LinkOutlined />} disabled onClick={addItem}>
                                    Link Budget
                                </Button>
                            </Flex>
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
                label: 'Proceed Next Month',
                icon: <ArrowUpOutlined />,
                key: '1',
                disabled: true,
            },
            {
                label: 'Share Budget',
                key: '2',
                icon: <LinkOutlined />,
                onClick: () => { },
                disabled: true,
            },
            {
                label: 'History',
                key: '3',
                icon: <CalendarOutlined />,
                onClick: () => { },
                disabled: true,
            },
            {
                label: 'Trends',
                key: '4',
                icon: <LineChartOutlined />,
                onClick: () => { },
                disabled: true,

            },
            {
                label: 'Sign Out',
                key: '5',
                icon: <LogoutOutlined />,
                onClick: () => { window.location.href = "/.auth/logout" },
            },
        ];
        return (
            <Dropdown menu={{ items }} arrow >
                <Button type="default" icon={< MoreOutlined />} size="large" ></Button>
            </Dropdown >
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