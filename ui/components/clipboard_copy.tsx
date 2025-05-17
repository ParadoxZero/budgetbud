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

import { CheckOutlined, CopyOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Typography } from "antd";
import { useEffect, useState } from "react";

export function CopyToClipboard(props: {
  text: string;
  onCopy: () => void;
  size?: number;
}) {
  const [is_copied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(props.text).then(() => {
      props.onCopy();
      setIsCopied(true);
    });
  };

  let button_icon = <CopyOutlined />;
  if (is_copied) {
    button_icon = <CheckOutlined />;
  }

  return (
    <Flex justify="center" align="center" gap={20} style={{ width: "100%" }}>
      <Typography.Text style={{ fontSize: props.size }}>
        {props.text}
      </Typography.Text>
      <Button
        onClick={copyToClipboard}
        icon={button_icon}
        size="large"
        type="text"
      ></Button>
    </Flex>
  );
}
