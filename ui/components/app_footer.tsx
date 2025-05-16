import React from "react";
import { Flex, Typography } from "antd";
import { GithubOutlined } from "@ant-design/icons";

const AppFooter: React.FC = () => {
  return (
    <Flex vertical align="center" justify="space-evenly" style={{ padding: 10 }} gap={10}>
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
