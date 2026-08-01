/*
 * BudgetBud - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2026  Sidhin S Thomas <sidhin.thomas@gmail.com>
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


import {
  FileOutlined,
  LinkOutlined,
  LogoutOutlined,
  PlusOutlined,
  SmileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  Flex,
  Input,
  MenuProps,
  Select,
  Space,
  Typography,
} from "antd";
import React from "react";
import { connect } from "react-redux";
import { budgetSlice, headerSlice, navigate, store, View } from "../store";
import { getDataService } from "../services/data_service";
import { NumberToMonth } from "../utils";
import { LinkBudgetModal } from "./link_budget_modal";
import { NicknameModal } from "./nickname_modal";
import { SettingsModal } from "./settings_modal";

export interface HeaderBudgetDetails {
  name: string;
  id: string;
  period: {
    month: number;
    year: number;
  };
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
  open_model: 'share' | 'rollover' | 'link' | 'edit_nickname' | 'settings' | 'none';
}

class Header extends React.Component<HeaderProps, HeaderState> {
  render() {
    if (this.props.show_title) {
      return (
        <Flex
          justify="center"
          align="center"
          style={{ width: "100%", height: "100%" }}
        >
          <Typography.Title level={2}>{this.props.title}</Typography.Title>
        </Flex>
      );
    }
    return (
      <Flex
        justify="center"
        align="center"
        style={{ width: "100%", height: "100%" }}
        gap="small"
      >
        {this.render_budget_selector()}
        {this.render_more_menu()}
      </Flex>
    );
  }

  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      is_budget_selector_visible: false,
      open_model: 'none',
    };
  }

  render_budget_selector() {
    const items = this.props.budget_list.map((budget, index) => ({
      name:
        budget.name +
        " (" +
        NumberToMonth(budget.period.month) +
        " " +
        budget.period.year +
        ")",
      value: index,
    }));
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
    const addItem = (
      e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    ) => {
      this.setState({ is_budget_selector_visible: false });
      e.preventDefault();
      store.dispatch(headerSlice.actions.header({ is_visible: false }));
      store.dispatch(budgetSlice.actions.updateSelection({ index: null }));
      store.dispatch(navigate(View.NoBudgetAvailable));
    };
    const linkBudget = (
      e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    ) => {
      this.setState({ open_model: 'link' });
      e.preventDefault();
    };
    const onSelectionChanged = (value: number) => {
      store.dispatch(budgetSlice.actions.updateSelection({ index: value }));
    };
    const onSettingsClicked = () => {
      this.setState({ is_budget_selector_visible: false });
      store.dispatch(navigate(View.NoBudgetAvailable));
    };

    return (
      <>
        <Select
          size="large"
          style={{ width: 300 }}
          placeholder="Select Budget"
          options={items.map((item) => ({
            label: item.name,
            value: item.value,
          }))}
          defaultValue={defaultValue}
          onChange={onSelectionChanged}
          onOpenChange={(visible) => {
            this.setState({ is_budget_selector_visible: visible });
          }}
          open={this.state.is_budget_selector_visible}
          popupRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: "8px 0" }} />
              <Space style={{ padding: "0 8px 4px" }} />
              <Flex gap={10} justify="space-evenly">
                <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
                  New
                </Button>
                <Button
                  type="text"
                  icon={<LinkOutlined />}
                  onClick={linkBudget}
                >
                  Link
                </Button>
              </Flex>
            </>
          )}
          labelRender={(label) => (
            <Flex
              justify="space-between"
              align="center"
              style={{ color: "rgba(0, 0, 0, 0.25)" }}
            >
              <Typography style={{ color: "rgba(0, 0, 0, 0.25)" }}>
                {label.label}
              </Typography>
            </Flex>
          )}
          variant="outlined"
        />
        <LinkBudgetModal
          isOpen={this.state.open_model === 'link'}
          onDone={() => {
            store.dispatch(navigate(View.Overview));
            getDataService().getBudget().then((data) => {
              if (data.length) {
                store.dispatch(budgetSlice.actions.set({
                  budget_list: data,
                  selected_budget_index: data.length - 1, // newly added budget is appended last
                }));
              }
            });
          }}
          onClose={() => {
            this.setState({ open_model: 'none' });
          }}
        />
      </>
    );
  }

  render_more_menu() {
   
    const items: MenuProps["items"] = [
      {
        label: "Settings",
        key: "2",
        onClick: () => {
          this.setState({ open_model: 'settings' });
        },
      },
      {
        label: "Edit Nickname",
        key: "3",
        onClick: () => {
          this.setState({ open_model: 'edit_nickname' });
        },
        disabled: false,
      },
      {
        label: "Sign Out",
        key: "6",
        onClick: () => {
          window.location.href = "/logout";
        },
      },
    ];
    return (
      <>
        <Dropdown menu={{ items }} >
          <Button type="default" icon={<UserOutlined />} shape="circle" size="large"></Button>
        </Dropdown>
        <NicknameModal
          isOpen={this.state.open_model === 'edit_nickname'}
          onDone={() => {
            this.setState({ open_model: 'none' });
          }}
        />
        <SettingsModal
          isOpen={this.state.open_model === 'settings'}
          onDone={() => {
            this.setState({ open_model: 'none' });
          }}
        />
      </>
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
