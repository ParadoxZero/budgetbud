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

import React, { useState } from "react";
import {
  Button,
  Collapse,
  Flex,
  List,
  Popconfirm,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Recurring, RecurringType } from "../datamodel/datamodel";
import { DataService } from "../services/data_service";
import { SubscriptionModal } from "./subscription_modal";
import { budgetSlice, store } from "../store";

const { Text } = Typography;

interface SubscriptionsSectionProps {
  budget_id: string;
  recurringList: Recurring[];
  dataService: DataService;
}

const frequencyLabel: Record<RecurringType, string> = {
  [RecurringType.weekly]: "Weekly",
  [RecurringType.biweekly]: "Bi-weekly",
  [RecurringType.monthly]: "Monthly",
  [RecurringType.quarterly]: "Quarterly",
  [RecurringType.halfYearly]: "Half-yearly",
  [RecurringType.yearly]: "Yearly",
};

const frequencyColor: Record<RecurringType, string> = {
  [RecurringType.weekly]: "blue",
  [RecurringType.biweekly]: "cyan",
  [RecurringType.monthly]: "green",
  [RecurringType.quarterly]: "orange",
  [RecurringType.halfYearly]: "gold",
  [RecurringType.yearly]: "purple",
};

const SubscriptionsSection: React.FC<SubscriptionsSectionProps> = ({
  budget_id,
  recurringList,
  dataService,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Recurring | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (values: Partial<Recurring>) => {
    setLoading(true);
    dataService
      .updateRecurring(budget_id, values as Recurring)
      .then((updatedBudget) => {
        store.dispatch(budgetSlice.actions.updateCurrent(updatedBudget));
        setModalOpen(false);
        setEditing(null);
        message.success(editing ? "Subscription updated" : "Subscription added");
      })
      .catch(() => {
        message.error("Failed to save subscription");
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = (recurringId: number) => {
    dataService
      .deleteRecurring(budget_id, recurringId)
      .then((updatedBudget) => {
        store.dispatch(budgetSlice.actions.updateCurrent(updatedBudget));
        message.success("Subscription removed");
      })
      .catch(() => {
        message.error("Failed to remove subscription");
      });
  };

  const totalMonthly = recurringList.reduce((sum, r) => {
    switch (r.frequency) {
      case RecurringType.weekly:
        return sum + r.amount * 4.33;
      case RecurringType.biweekly:
        return sum + r.amount * 2.17;
      case RecurringType.monthly:
        return sum + r.amount;
      case RecurringType.yearly:
        return sum + r.amount / 12;
      default:
        return sum + r.amount;
    }
  }, 0);

  const collapseItems = [
    {
      key: "subscriptions",
      label: (
        <Flex justify="space-between" align="center" style={{ width: "100%" }}>
          <Flex align="center" gap={8}>
            <SyncOutlined />
            <Text strong>Subscriptions & Recurring</Text>
            {recurringList.length > 0 && (
              <Tag color="blue">{recurringList.length}</Tag>
            )}
          </Flex>
          {recurringList.length > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              ~{Math.round(totalMonthly)}/mo
            </Text>
          )}
        </Flex>
      ),
      children: (
        <>
          <List
            dataSource={recurringList}
            locale={{ emptyText: "No subscriptions yet" }}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditing(item);
                      setModalOpen(true);
                    }}
                  />,
                  <Popconfirm
                    key="delete"
                    title="Remove this subscription?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Remove"
                    cancelText="Cancel"
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <Flex align="center" gap={8}>
                      <Text>{item.name}</Text>
                      <Tag color={frequencyColor[item.frequency]}>
                        {frequencyLabel[item.frequency]}
                      </Tag>
                    </Flex>
                  }
                  description={item.description || undefined}
                />
                <Text strong>{item.amount}</Text>
              </List.Item>
            )}
          />
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            style={{ marginTop: 8, width: "100%" }}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Add Subscription
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Collapse
        ghost
        items={collapseItems}
        style={{ marginTop: 4, marginBottom: 4 }}
      />
      <SubscriptionModal
        isOpen={modalOpen}
        isLoading={loading}
        initialValues={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default SubscriptionsSection;
