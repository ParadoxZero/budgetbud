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

import React from "react";
import { Checkbox, Typography, Flex } from "antd";
import type { CheckboxChangeEvent } from "antd/lib/checkbox";

const { Text } = Typography;

interface SingleCategoryCheckboxProps {
  title: string;
  total: number;
  isChecked: boolean;
  onCheck: () => void;
  onUncheck: () => void;
}

const SingleCategoryCheckbox: React.FC<SingleCategoryCheckboxProps> = ({
  title,
  total,
  isChecked,
  onCheck,
  onUncheck,
}) => {
  const handleChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      onCheck();
    } else {
      onUncheck();
    }
  };

  return (
    <div
      style={{
        margin: 0,
        marginTop: 10,
        marginBottom: 10,
        paddingRight: 20,
        paddingLeft: 20,
        minWidth: 300,
        opacity: isChecked ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={12}>
          <Checkbox
            checked={isChecked}
            onChange={handleChange}
            style={{ transform: "scale(1.3)", transformOrigin: "left center" }}
          />
          <Text
            strong
            type="secondary"
            style={{
              fontSize: 18,
              textDecoration: isChecked ? "line-through" : "none",
            }}
          >
            {title}
          </Text>
        </Flex>
        <Text type="secondary" style={{ fontSize: 14 }}>
          {total}
        </Text>
      </Flex>
    </div>
  );
};

export default SingleCategoryCheckbox;
