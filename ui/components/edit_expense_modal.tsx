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

import React, { useEffect } from "react";
import { Modal, Input, Select, Button, Form } from "antd";
import { Expense } from "../datamodel/datamodel";

export interface EditExpenseModalProps {
  isOpen: boolean;
  categories: { id: number; name: string }[];
  expense: Expense;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (title: string, amount: number, categoryId: number) => void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  categories,
  expense,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (isOpen) {
      form.setFieldsValue({
        categoryId: expense.categoryId,
        amount: expense.amount,
        title: expense.title,
      });
    }
  }, [isOpen, expense, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values.title, parseFloat(values.amount), values.categoryId);
        form.resetFields();
      })
      .catch((info) => {
        console.error("Validation Failed:", info);
      });
  };

  return (
    <Modal
      title="Edit Expense"
      open={isOpen}
      loading={isLoading}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Category"
          name="categoryId"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select placeholder="Select a category">
            {categories.map((category) => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Title" name="title">
          <Input placeholder="Expense Title" />
        </Form.Item>
        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: "Please enter an amount" }]}
        >
          <Input type="number" placeholder="Expense Amount" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
