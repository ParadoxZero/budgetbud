/*
 * BudgetBud - Budgeting and Expense Tracker with WebUI and API server
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

import React, { useEffect } from "react";
import { Modal, Input, Select, Button, Form, InputNumber } from "antd";
import { Recurring, RecurringType } from "../datamodel/datamodel";

export interface SubscriptionModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  initialValues?: Recurring | null;
  onClose: () => void;
  onSubmit: (recurring: Partial<Recurring>) => void;
}

const frequencyOptions = [
  { label: "Weekly", value: RecurringType.weekly },
  { label: "Bi-weekly", value: RecurringType.biweekly },
  { label: "Monthly", value: RecurringType.monthly },
  { label: "Yearly", value: RecurringType.yearly },
];

const frequencyUnitLabel: Record<RecurringType, string> = {
  [RecurringType.weekly]: "Day of Week (0=Sun, 6=Sat)",
  [RecurringType.biweekly]: "Day of Week (0=Sun, 6=Sat)",
  [RecurringType.monthly]: "Day of Month (1-31)",
  [RecurringType.quarterly]: "Month (0-11)",
  [RecurringType.halfYearly]: "Month (0-11)",
  [RecurringType.yearly]: "Month (0-11)",
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  isLoading,
  initialValues,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [frequency, setFrequency] = React.useState<RecurringType>(
    initialValues?.frequency ?? RecurringType.monthly,
  );

  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          description: initialValues.description,
          amount: initialValues.amount,
          frequency: initialValues.frequency,
          frequencyUnit: initialValues.frequencey_unit,
        });
        setFrequency(initialValues.frequency);
      } else {
        form.resetFields();
        setFrequency(RecurringType.monthly);
      }
    }
  }, [isOpen, initialValues]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit({
          id: initialValues?.id ?? 0,
          name: values.name,
          description: values.description ?? "",
          amount: values.amount,
          frequency: values.frequency,
          frequencey_unit: values.frequencyUnit ?? 1,
          isActive: true,
          startDate: initialValues?.startDate ?? Date.now(),
          endDate: initialValues?.endDate ?? 0,
          lastUpdated: Date.now(),
        });
        form.resetFields();
      })
      .catch((info) => {
        console.error("Validation Failed:", info);
      });
  };

  return (
    <Modal
      title={initialValues ? "Edit Subscription" : "Add Subscription"}
      open={isOpen}
      loading={isLoading}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          {initialValues ? "Save" : "Add"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          frequency: RecurringType.monthly,
          frequencyUnit: 1,
        }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter a name" }]}
        >
          <Input placeholder="e.g. Netflix, Rent, Internet" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input placeholder="Optional description" />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="amount"
          rules={[{ required: true, message: "Please enter an amount" }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            placeholder="Amount"
          />
        </Form.Item>

        <Form.Item
          label="Frequency"
          name="frequency"
          rules={[{ required: true, message: "Please select a frequency" }]}
        >
          <Select
            options={frequencyOptions}
            onChange={(value: RecurringType) => setFrequency(value)}
          />
        </Form.Item>

        <Form.Item
          label={frequencyUnitLabel[frequency]}
          name="frequencyUnit"
          rules={[{ required: true, message: "Please specify the timing" }]}
        >
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
