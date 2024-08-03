import { FileOutlined, MoreOutlined, PlusOutlined, SettingOutlined } from "@ant-design/icons";
import { Avatar, Button, Divider, Flex, Input, InputRef, Select, Space, Typography } from "antd";
import React from "react";
import { connect } from "react-redux";
import { budgetSlice, headerSlice, navigation, store, View } from "../store";

export interface HeaderBudgetDetails {
    name: string;
    id: string;
}

export interface HeaderProps {
    title: string;
    isVisible: boolean;
    budget_list: HeaderBudgetDetails[];
    selected_budget_index: number | null;
}

interface HeaderState {
    is_budget_selector_visible: boolean;
}

class Header extends React.Component<HeaderProps, HeaderState> {

    render() {
        return (
            <Flex justify="space-evenly" align="center" style={{ width: "100%", height: "100%" }}>
                {this.render_budget_selector()}
                <Button type="default" icon={<MoreOutlined />} size="large"></Button>
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
            store.dispatch(navigation(View.NoBudgetAvailable));
        };
        const onSelectionChanged = (value: number) => {
            store.dispatch(budgetSlice.actions.updateSelection({ index: value }));
        }
        const onSettingsClicked = () => {
            this.setState({ is_budget_selector_visible: false });
            store.dispatch(navigation(View.NoBudgetAvailable));
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

}

function mapStateToProps(state: any): HeaderProps {
    return {
        budget_list: state.budget.budget_list,
        selected_budget_index: state.budget.selected_budget_index,
        title: state.header.title,
        isVisible: state.header.is_visible
    };
}

export default connect(mapStateToProps)(Header);