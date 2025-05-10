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

import React from "react";
import {
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  Input,
  Progress,
  Spin,
  Statistic,
} from "antd";
import {
  CheckCircleOutlined,
  LoadingOutlined,
  PlusCircleFilled,
  WalletOutlined,
} from "@ant-design/icons";
import {
  GetScreenSize,
  GetStatusFromPercent,
  ScreenSize,
  Status,
} from "../utils";
import { DataService, getDataService } from "../services/data_service";
import { DataModelFactory, Recurring, Budget, Expense } from "../datamodel/datamodel";
import { Typography } from "antd";
import { RecurringCalculatorService } from "../services/recurring_date_service";
import { BaseType } from "antd/es/typography/Base";
import {
  navigate,
  View,
  store,
  headerSlice,
  budgetSlice,
  to_category_view,
} from "../store";

import "../main.css";
import { connect } from "react-redux";
import { AddExpenseModal } from "../components/add_expense_modal";
import SingleCategory from "../components/single_category";
import EditCategory, { EditCategoryState } from "../components/edit_category";

const { Text } = Typography;

interface OverviewProps {
  budget_list: Budget[];
  selected_budget_index: number | null;
}

interface AddExpenseContext {
  category_id: number;
  amount: number;
  filled: boolean;
  processing: boolean;
  isModalOpen: boolean;
}

interface IState {
  total_allocations: number;
  filled_allocations: { [key: number]: number };
  upcoming_expense: { name: string; amount: number } | null;
  add_expense_mode_context: AddExpenseContext | null;
  previous_budget_index: number | null;
}

class OverviewPage extends React.Component<OverviewProps, IState> {
  _data_service: DataService;
  _recurring_calculator_service: RecurringCalculatorService;

  render_available_budget() {
    const used_up_budget = Object.values(this.state.filled_allocations).reduce(
      (acc, curr) => (acc += curr),
      0,
    );
    const percent = (used_up_budget / this.state.total_allocations) * 100;
    let status_color = "#3f8600";
    switch (GetStatusFromPercent(percent)) {
      case Status.error:
        status_color = "#ff4d4f";
        break;
      case Status.warning:
        status_color = "ffa940";
        break;
      case Status.completed:
        status_color = "#4096ff";
        break;
    }
    const remaining_budget = this.state.total_allocations - used_up_budget;
    return (
      <div style={{ margin: 10 }}>
        <Statistic
          title="Budget Remaining"
          groupSeparator=""
          value={remaining_budget}
          precision={0}
          suffix={"/ " + this.state.total_allocations.toString()}
          valueStyle={{ color: status_color }}
        />
      </div>

    );
  }

  render_upcoming() {
    let content = (
      <Empty
        description="No upcoming expense"
        imageStyle={{ height: "auto", color: "#3f8600", fontSize: 48 }}
        image={<CheckCircleOutlined />}
      />
    );
    if (this.state.upcoming_expense != null) {
      content = (
        <Statistic
          title="Upcoming"
          value={this.state.upcoming_expense.amount}
          prefix={<WalletOutlined />}
          suffix={this.state.upcoming_expense.name}
        />
      );
    }
    return (
      <Card bordered={false} hoverable style={{ margin: 10 }}>
        {content}
      </Card>
    );
  }

  render_add_expense_button() {
    const budget = this.props.budget_list[this.props.selected_budget_index!];
    const first_category_id = budget.categoryList[0].id;

    return (
      <div style={{ margin: 10 }}>
        <Button
          type="default"
          icon={<PlusCircleFilled />}
          size="large"
          onClick={() => {
            this.setState({
              add_expense_mode_context: {
                category_id: first_category_id,
                filled: false,
                processing: false,
                isModalOpen: true,
                amount: 0,
              },
            });
          }}
        >
          Add Expense
        </Button>

      </div>
    );
  }


  header() {
    return (
      <Flex vertical={GetScreenSize() == ScreenSize.desktop} align="center" justify="space-evenly">
        {this.render_available_budget()}
        {this.render_add_expense_button()}
      </Flex>
    );
  }

  add_expense(category_id: number, title: string, amount: number) {
    const budget = this.props.budget_list[this.props.selected_budget_index!];
    const expense = DataModelFactory.createExpense(
      0,
      category_id,
      amount,
      title,
    );
    console.log("Adding expense", expense);
    this._data_service
      .updateExpense(budget.id, expense)
      .then((data) => {
        store.dispatch(budgetSlice.actions.updateCurrent(data));
        this.setState({ add_expense_mode_context: null });
      })
      .catch(() => this.setState({ add_expense_mode_context: null }));

  }

  render_add_single_category_expense() {
    const context = this.state.add_expense_mode_context;
    if (!context) return null;

    const handle_add_expense = () => {
      this.add_expense(context!.category_id, "", context!.amount);
    };

    const handle_input_change = (e: React.ChangeEvent<HTMLInputElement>) => {
      const entered_amount = parseFloat(e.target.value);
      context.filled = entered_amount > 0;
      context.amount = entered_amount;
      this.setState({ add_expense_mode_context: context });
    };

    let state = EditCategoryState.Unfilled;
    if (context.processing) {
      state = EditCategoryState.Processing;
    } else if (context.filled) {
      state = EditCategoryState.Filled;
    }

    return (
      <EditCategory
        state={state}
        onAddExpense={handle_add_expense}
        onInputChange={handle_input_change}
        onModalRequested={() => {
          this.setState({
            add_expense_mode_context: {
              ...context,
              isModalOpen: true,
            },
          });
        }}
        onCloseRequested={() => {
          this.setState({ add_expense_mode_context: null });
        }}
      />
    );
  }

  render_view_single_category(
    id: number,
    title: string,
    value: number,
    total: number,
  ) {
    const percent = total + value === 0 ? 100 : Math.floor((value / total) * 100);
    const status = GetStatusFromPercent(percent);

    const on_click = () => {
      if (
        this.state.add_expense_mode_context?.filled ||
        this.state.add_expense_mode_context?.processing
      ) {
        return;
      }
      this.setState({
        add_expense_mode_context: {
          category_id: id,
          filled: false,
          processing: false,
          isModalOpen: false,
          amount: 0,
        },
      });
    };

    const on_right_button_click = () => {
      store.dispatch(to_category_view(id));
    };

    return (
      <SingleCategory
        id={id}
        title={title}
        value={value}
        total={total}
        percent={percent}
        status={status}
        onClick={on_click}
        onRightButtonClick={on_right_button_click}
      />
    );
  }

  render_catogory_list_row(
    id: number,
    title: string,
    value: number,
    total: number,
  ) {
    const add_expense_mode_context = this.state.add_expense_mode_context;
    if (add_expense_mode_context && add_expense_mode_context.category_id === id) {
      return this.render_add_single_category_expense();
    }
    return this.render_view_single_category(id, title, value, total);
  }

  render_add_expense_modal() {
    if (this.props.selected_budget_index == null) return null;

    const budget = this.props.budget_list[this.props.selected_budget_index];
    const categories = budget.categoryList.map((category) => ({
      id: category.id,
      name: category.name,
    }));
    const context = this.state.add_expense_mode_context;
    if (!context) return null;
    return (
      <AddExpenseModal
        isOpen={context.isModalOpen || false}
        categories={categories}
        defaultCategoryId={context.category_id}
        defaultAmount={context.amount}
        isLoading= {
          context.processing
        }
        onClose={() => {
          this.setState({ add_expense_mode_context: null });
        }}
        onSubmit={(title, amount, categoryId) => {
          console.log("Adding expense", title, amount, categoryId);
          this.add_expense(categoryId, title, amount);
        }}
      />
    );
  }

  render_categories() {
    const minWidth = GetScreenSize() != ScreenSize.mobile ? 500 : 0;

    if (this.props.selected_budget_index != null) {
      const budget = this.props.budget_list[this.props.selected_budget_index];
      return (
        <div
          style={{
            margin: 0,
            marginTop: 0,
            marginBottom: 10,
            padding: 0,
            minWidth: minWidth,
          }}
        >
          <Flex align="stretch" justify="space-around" vertical>
            <Divider style={{ margin: 0, padding: 0 }} />
            {budget?.categoryList.map((category) => (
              <div key={category.id}>
                {this.render_catogory_list_row(
                  category.id,
                  category.name,
                  this.state.filled_allocations[category.id],
                  category.allocation,
                )}
                <Divider style={{ margin: 0, padding: 0 }} />
              </div>
            ))}
          </Flex>
        </div>
      );
    }
    return (
      <Card
        bordered={false}
        style={{ margin: 0, marginTop: 0, marginBottom: 10, padding: 0 }}
      >
        <Flex align="center" justify="center" style={{ height: 200 }}>
          <Empty
            description="No budget details"
            imageStyle={{ height: "auto", fontSize: 48 }}
          />
        </Flex>
      </Card>
    );
  }

  render_page() {
    return (
      <Flex
        vertical={GetScreenSize() != ScreenSize.desktop}
        justify={
          GetScreenSize() != ScreenSize.desktop ? "stretch" : "center"
        }
        align={
          GetScreenSize() != ScreenSize.desktop ? "stretch" : "flex-start"
        }
      >
        {this.header()}
        {this.render_categories()}
        {this.render_add_expense_modal()}
      </Flex>
    );
  }

  render() {
    if (this.props.selected_budget_index == null) {
      return (
        <Flex
          vertical
          justify="center"
          align="center"
          style={{ height: "100vh" }}
        >
          <Spin
            size="large"
            indicator={<LoadingOutlined style={{ fontSize: 48 }} />}
          />
        </Flex>
      );
    }
    return this.render_page();
  }

  constructor(props: any) {
    super(props);
    this._data_service = getDataService();
    this._recurring_calculator_service = new RecurringCalculatorService();
    this.state = {
      total_allocations: 0,
      filled_allocations: {},
      upcoming_expense: null,
      add_expense_mode_context: null,
      previous_budget_index: null,
    };
  }

  componentDidMount(): void {
    this.setState({ previous_budget_index: this.props.selected_budget_index });
    store.dispatch(headerSlice.actions.header({ is_visible: false }));
    store.dispatch(headerSlice.actions.showBudgetSelect());
    store.dispatch(budgetSlice.actions.clear());

    this._data_service
      .getBudget()
      .then((data) => {
        if (data.length) {
          let selected_index = 0;
          if (
            this.state.previous_budget_index != null &&
            this.state.previous_budget_index < data.length
          ) {
            selected_index = this.state.previous_budget_index;
          }
          store.dispatch(
            budgetSlice.actions.set({
              budget_list: data,
              selected_budget_index: selected_index,
            }),
          );
          this.setState({ previous_budget_index: selected_index });
          store.dispatch(headerSlice.actions.header({ is_visible: true }));
          this.update_calculations();
          this.update_next_recurring();
        } else {
          this.navigate_to(View.NoBudgetAvailable);
        }
      })
      .catch((e) => {
        console.error(e);
        setTimeout(() => this.componentDidMount(), 1000);
      });
  }

  componentDidUpdate(
    prevProps: Readonly<OverviewProps>,
    _prevState: Readonly<IState>,
    _snapshot?: any,
  ): void {
    if (this.props.selected_budget_index != null) {
      const current_budget =
        this.props.budget_list[this.props.selected_budget_index];
      if (
        prevProps.selected_budget_index != this.props.selected_budget_index ||
        (prevProps.selected_budget_index != null &&
          prevProps.budget_list[prevProps.selected_budget_index].last_updated !=
            current_budget.last_updated)
      ) {
        {
          this.update_calculations();
          this.update_next_recurring();
        }
      }
    }
  }

  private navigate_to(view: View) {
    store.dispatch(navigate(view));
  }

  private update_next_recurring() {
    if (
      this.props.selected_budget_index == null ||
      this.props.budget_list == null
    ) {
      return;
    }
    const budget = this.props.budget_list[this.props.selected_budget_index!];
    const recurring_list: Recurring[] = budget.recurringList;
    const next_dates_ = recurring_list
      .map((recurring) => ({
        next_date:
          this._recurring_calculator_service.calculateNextDate(recurring),
        data: recurring,
      }))
      .sort((a, b) => a.next_date.getTime() - b.next_date.getTime());

    if (next_dates_.length > 0) {
      this.setState({
        upcoming_expense: {
          name: next_dates_[0].data.name,
          amount: next_dates_[0].data.amount,
        },
      });
    }
  }
  private update_calculations() {
    if (
      this.props.selected_budget_index == null ||
      this.props.budget_list == null
    ) {
      return;
    }
    const budget = this.props.budget_list[this.props.selected_budget_index!];
    let total_allocations = 0;
    budget?.categoryList.forEach((category) => {
      total_allocations += category.allocation;
    });
    const filled_allocations: { [key: string]: number } = {}; // Add type annotation
    budget?.categoryList.forEach((category) => {
      filled_allocations[category.id] = 0;
      category.expenseList.forEach((expense) => {
        filled_allocations[category.id] += expense.amount;
      });
    });
    this.setState({
      total_allocations: total_allocations,
      filled_allocations: filled_allocations,
    });
  }
}

function mapStateToProps(state: any): OverviewProps {
  return {
    budget_list: state.budget.budget_list,
    selected_budget_index: state.budget.selected_budget_index,
  };
}
export default connect(mapStateToProps)(OverviewPage);
