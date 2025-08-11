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
import { Flex, Typography } from "antd";
import { GithubOutlined } from "@ant-design/icons";

const AppFooter: React.FC = () => {
  return (
    <Flex
      vertical
      align="center"
      justify="space-evenly"
      style={{ padding: 10 }}
      gap={10}
    >
      <br />
      <Typography.Text style={{ userSelect: "text" }}>
        Copyright © 2025 Sidhin S Thomas. All rights reserved.
      </Typography.Text>
      <a
        href="https://github.com/ParadoxZero/budgetbud"
        target="_blank"
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        <GithubOutlined style={{ fontSize: 18 }} />
        <span>View on GitHub</span>
      </a>
    </Flex>
  );
};

export default AppFooter;
