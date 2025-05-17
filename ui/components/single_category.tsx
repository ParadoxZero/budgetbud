/*
 * BudgetBug - Budgeting and Expense Tracker with WebUI and API server
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
import { Button, Progress, Typography, Flex } from "antd";
import { RightOutlined } from "@ant-design/icons";

import { Status } from "../utils";

const { Text } = Typography;

interface SingleCategoryProps {
  id: number;
  title: string;
  value: number;
  total: number;
  percent: number;
  status: Status;
  onClick: () => void;
  onRightButtonClick: () => void;
}

const SingleCategory: React.FC<SingleCategoryProps> = ({
  title,
  value,
  total,
  percent,
  status,
  onClick,
  onRightButtonClick,
}) => {
  let progress_color = "#3f8600";
  let text_type: "success" | "danger" | "warning" | "secondary" = "success";

  switch (status) {
    case Status.error:
      progress_color = "#ff4d4f";
      text_type = "danger";
      break;
    case Status.warning:
      progress_color = "#ffa940";
      text_type = "warning";
      break;
    case Status.completed:
      progress_color = "#4096ff";
      text_type = "secondary";
      break;
  }

  return (
    <div
      style={{
        margin: 0,
        marginTop: 10,
        marginBottom: 10,
        paddingRight: 20,
        paddingLeft: 20,
        minWidth: 300,
      }}
      className="touchahble"
      onClick={onClick}
    >
      <Flex align="center" justify="space-between">
        <Text strong type="secondary" style={{ fontSize: 18 }}>
          {title}
        </Text>
        <Flex align="center" justify="right">
          <Flex align="flex-end" justify="center" vertical>
            <Text type="secondary"> Remaining</Text>
            <Text strong type={text_type}>
              {total - value} / {total}{" "}
            </Text>
            <Progress
              type="line"
              percent={percent}
              strokeColor={progress_color}
              style={{
                marginBottom: 14,
                minWidth: 100,
              }}
              status={percent <= 100 ? "active" : "exception"}
            />
          </Flex>
          <Button
            shape="circle"
            type="default"
            icon={<RightOutlined />}
            style={{ padding: 20, marginLeft: 20 }}
            onClick={onRightButtonClick}
          ></Button>
        </Flex>
      </Flex>
    </div>
  );
};

export default SingleCategory;
