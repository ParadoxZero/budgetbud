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

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import "./main.css";
import { Button, Card, Col, ConfigProvider, Divider, Flex, Layout, Row, Space, Typography, Image } from "antd";
import {
  GithubOutlined,
  GoogleOutlined,
  LeftOutlined,
  LoadingOutlined,
  PlayCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";

import { GetScreenSize, ScreenSize } from "./utils";

function SignInButtons({ compact = false }: { compact?: boolean }) {
  return (
    <Flex align="center" wrap  gap={10}>
      <Typography.Title level={4} style={{ margin: 10 }}>Sign in with</Typography.Title>
      <Flex gap={10} >
        <Button
          type="primary"
          style={{ backgroundColor: "#f5222d" }}
          href=".auth/login/google?post_login_redirect_uri=/app.html&access_type=offline"
          size={compact ? "middle" : "large"}
          icon={<GoogleOutlined />}
        >
          Google
        </Button>
        <Button
          type="primary"
          style={{ backgroundColor: "#262626" }}
          href=".auth/login/github?post_login_redirect_uri=/app.html"
          size={compact ? "middle" : "large"}
          icon={<GithubOutlined />}
        >
          GitHub
        </Button>
      </Flex>
    </Flex>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const checkAuth = async () => {
      try {
        const me = await fetch("/.auth/me");
        if (me.ok) {
          window.location.href = "/app.html";
          return;
        }
        const refreshed = await fetch("/.auth/refresh");
        if (refreshed.ok) {
          window.location.href = "/app.html";
          return;
        }
      } catch (e) {
        // no-op
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const { Header, Content, Footer } = Layout;
  const [current, setCurrent] = React.useState(0);
  return (
    <Layout className="landing-root">
      {/* Ant Design Header */}
      <Header className="landing-header" style={{ width: "100%" }}>
        <Flex className="container signin-area" align="center" justify="end">
          {/* Logo */}
          {isLoading ? (
            <Button type="text" icon={<LoadingOutlined />} disabled>
              Checking sign-in...
            </Button>
          ) : (
              <SignInButtons compact />
          )}
        </Flex>
      </Header>

      {/* Ant Design Content */}
      <Content>
        {/* Hero */}
        <div className="hero">
          <div className="container">
            <Flex vertical gap={16} align="center" style={{ textAlign: "center" }}>
              <img src="/logo.png" alt="BudgetBud logo" width={80} height={80} />
              <Typography.Title level={1} style={{ margin: 0 }}>BudgetBud</Typography.Title>
              <Typography.Paragraph style={{ fontSize: 18, maxWidth: 800 }}>
                A simple, free, no-nonsense and collaborative budgeting tool to manage expenses efficiently.
              </Typography.Paragraph>
            </Flex>
          </div>
        </div>

        {/* Demo CTA */}
        <div className="demo-section">
          <div className="container">
            <Card className="demo-card" bordered>
              <Flex gap={16} align="center" justify="space-evenly" wrap vertical>
                <Typography.Text style={{ fontSize: 16 }}>
                  Check out a demo of budgetbud without signing in.
                </Typography.Text>
                <Button
                  type="primary"
                  size="large"
                  href="/demo.html"
                  icon={<PlayCircleOutlined />}
                >
                  Try it out!
                </Button>
              </Flex>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="features">
          <div className="container">
            <Typography.Title level={3} style={{ textAlign: "center" }}>Features</Typography.Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card hoverable>
                  <Typography.Title level={4} style={{ marginTop: 0 }}>Create & Manage Multiple Budgets</Typography.Title>
                  <Typography.Paragraph>
                    Set up budgets with categories like rent, groceries, entertainment, and more.
                  </Typography.Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card hoverable>
                  <Typography.Title level={4} style={{ marginTop: 0 }}>Track Expenses</Typography.Title>
                  <Typography.Paragraph>
                    Add and remove expenses to see remaining funds and spending patterns.
                  </Typography.Paragraph>
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card hoverable>
                  <Typography.Title level={4} style={{ marginTop: 0 }}>Collaborate with Others</Typography.Title>
                  <Typography.Paragraph>
                    Share your budget with family or roommates for seamless planning.
                  </Typography.Paragraph>
                </Card>
              </Col>
            </Row>
          </div>
        </div>

        {/* Screenshots placeholders */}
        <div className="screenshots">
          <div className="container">
            <Typography.Title level={3} style={{ textAlign: "center" }}>Screenshots</Typography.Title>
            <Image.PreviewGroup
             preview={{
        toolbarRender: (
          _,
          {
            actions: {
              onActive,
            },
          },
        ) => (
          <Space size={12} className="toolbar-wrapper">
            <LeftOutlined disabled={current === 0} onClick={() => onActive?.(-1)} />
            <RightOutlined disabled={current === 3} onClick={() => onActive?.(1)} />
          </Space>
        ),
        onChange: (index) => {
          setCurrent(index);
        },
      }}>
              <Flex gap={16} justify="center" align="center" wrap>
                <Image
                  key={0}
                  src="/mobile1.png"
                  alt="BudgetBud mobile screenshot 1"
                  height={300}
                />
                <Image
                  key={1}
                  src="/mobile2.png"
                  alt="BudgetBud mobile screenshot 2"
                  height={300}
                />
                <Image
                  key={2}
                  src="/desktop1.png"
                  alt="BudgetBud desktop screenshot"
                  height={300}
                />
              </Flex>
            </Image.PreviewGroup>
          </div>
        </div>

        {/* Principles / About */}
        <div className="about">
          <div className="container">
            <Divider />
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                  <Typography.Title level={4} style={{ marginTop: 0 }}>Built on simple principles</Typography.Title>
                  <ul>
                    <li>Cost-efficient self-hosting on free tiers</li>
                    <li>Focused and minimalist—no bloat</li>
                    <li>Web-first PWA experience</li>
                    <li>Privacy-first—no Personally Identifiable Information (PII) stored</li>
                  </ul>
              </Col>
              <Col xs={24} md={12}>
                  <Typography.Title level={4} style={{ marginTop: 0 }}>Forever free and open source</Typography.Title>
                  <Typography.Paragraph>
                    The source is available on GitHub. Contributions are welcome.
                  </Typography.Paragraph>
                  <Space>
                    <Button type="primary" style={{ backgroundColor: "#262626" }}
                      href="https://github.com/ParadoxZero/budgetbud" target="_blank" icon={<GithubOutlined />}>View on GitHub</Button>
                  </Space>
              </Col>
            </Row>
          </div>
        </div>
      </Content>

      {/* Ant Design Footer */}
      <Footer className="footer">
        <div className="container">
          <Divider />
          <Flex align="center" justify="center" wrap>
            <Typography.Text type="secondary">BudgetBud © Sidhin S Thomas. All rights reserved</Typography.Text>
          </Flex>
        </div>
      </Footer>
    </Layout>
  );
}

const screenSize = GetScreenSize();
var headerHeight = screenSize === ScreenSize.mobile ? 128 : 64;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerBg: "white",
            bodyBg: "white",
            footerBg: "white",
            headerHeight: headerHeight,
          },
          Image: {
            borderRadiusOuter: 8,
          },
          Timeline: {},
        },
      }}
    >
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);
