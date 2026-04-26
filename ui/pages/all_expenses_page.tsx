/*
 * BudgetBud - Budgeting and Expense Tracker with WebUI and API server
 * Copyright (C) 2025  Sidhin S Thomas <sidhin.thomas@gmail.com>
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
import { Budget, Expense } from "../datamodel/datamodel";
import { budgetSlice, headerSlice, navigate, store, View } from "../store";
import { Button, Flex, Popconfirm, Table, Tag, Typography } from "antd";
import { DeleteFilled, EditFilled, LeftOutlined } from "@ant-design/icons";
import { DataService, getDataService } from "../services/data_service";
import { TicksToDate } from "../utils";
import { EditExpenseModal } from "../components/edit_expense_modal";

export interface AllExpensesPageProps {
  budget: Budget;
}

interface AllExpensesPageState {
  editingExpense: Expense | null;
  isLoading: boolean;
}

interface ExpenseRow {
  key: string;
  expenseId: number;
  categoryId: number;
  title: string;
  addedBy: string;
  amount: number;
  categoryName: string;
  timestamp: number;
}

class AllExpensesPage extends React.Component<
  AllExpensesPageProps,
  AllExpensesPageState
> {
  _data_service: DataService;

  constructor(props: AllExpensesPageProps) {
    super(props);
    this._data_service = getDataService();
    this.state = {
      editingExpense: null,
      isLoading: false,
    };
  }

  componentDidMount(): void {
    store.dispatch(
      headerSlice.actions.setTitle({ title: "All Expenses", show_title: true }),
    );
  }

  getExpenseRows(): ExpenseRow[] {
    const rows: ExpenseRow[] = [];
    for (const category of this.props.budget.categoryList) {
      for (const expense of category.expenseList) {
        rows.push({
          key: `${category.id}-${expense.id}`,
          expenseId: expense.id,
          categoryId: category.id,
          title: expense.title || "",
          addedBy: expense.addedBy || "Unknown",
          amount: expense.amount,
          categoryName: category.name,
          timestamp: expense.timestamp,
        });
      }
    }
    return rows.sort((a, b) => b.timestamp - a.timestamp);
  }

  handleDelete(categoryId: number, expenseId: number) {
    this.setState({ isLoading: true });
    this._data_service
      .deleteExpense(this.props.budget.id, categoryId, expenseId)
      .then((budget) => {
        store.dispatch(budgetSlice.actions.updateCurrent(budget));
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }

  handleEditSubmit(title: string, amount: number, categoryId: number) {
    if (!this.state.editingExpense) return;
    const updatedExpense: Expense = {
      ...this.state.editingExpense,
      title,
      amount,
      categoryId,
    };
    this.setState({ isLoading: true, editingExpense: null });
    this._data_service
      .updateExpense(this.props.budget.id, updatedExpense)
      .then((budget) => {
        store.dispatch(budgetSlice.actions.updateCurrent(budget));
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }

  render() {
    const categories = this.props.budget.categoryList.map((c) => ({
      id: c.id,
      name: c.name,
    }));

    const columns = [
      {
        title: "Date",
        dataIndex: "timestamp",
        key: "timestamp",
        render: (timestamp: number) =>
          TicksToDate(timestamp).toLocaleDateString(),
      },
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        render: (title: string) =>
          title ? (
            title
          ) : (
            <Typography.Text type="secondary">—</Typography.Text>
          ),
      },
      {
        title: "Added By",
        dataIndex: "addedBy",
        key: "addedBy",
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        render: (amount: number) => amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        align: "right" as const,
      },
      {
        title: "Category",
        dataIndex: "categoryName",
        key: "categoryName",
        render: (name: string) => <Tag>{name}</Tag>,
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: ExpenseRow) => {
          const category = this.props.budget.categoryList.find(
            (c) => c.id === record.categoryId,
          );
          const expense = category?.expenseList.find(
            (e) => e.id === record.expenseId,
          );
          return (
            <Flex gap={8}>
              <Button
                icon={<EditFilled />}
                size="small"
                onClick={() => expense && this.setState({ editingExpense: expense })}
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete this expense?"
                okText="Yes"
                cancelText="No"
                onConfirm={() =>
                  this.handleDelete(record.categoryId, record.expenseId)
                }
              >
                <Button icon={<DeleteFilled />} size="small" danger>
                  Delete
                </Button>
              </Popconfirm>
            </Flex>
          );
        },
      },
    ];

    return (
      <Flex vertical style={{ padding: 16 }}>
        <Flex gap={10} style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<LeftOutlined />}
            onClick={() => store.dispatch(navigate(View.Overview))}
          >
            Back
          </Button>
          <Typography.Title level={4} style={{ margin: 0 }}>
            All Expenses
          </Typography.Title>
        </Flex>
        <Table
          dataSource={this.getExpenseRows()}
          columns={columns}
          loading={this.state.isLoading}
          pagination={{ pageSize: 20, showSizeChanger: false }}
          scroll={{ x: "max-content" }}
          locale={{ emptyText: "No expenses recorded yet." }}
        />
        {this.state.editingExpense && (
          <EditExpenseModal
            isOpen={true}
            categories={categories}
            expense={this.state.editingExpense}
            isLoading={this.state.isLoading}
            onClose={() => this.setState({ editingExpense: null })}
            onSubmit={(title, amount, categoryId) =>
              this.handleEditSubmit(title, amount, categoryId)
            }
          />
        )}
      </Flex>
    );
  }
}

export default AllExpensesPage;
