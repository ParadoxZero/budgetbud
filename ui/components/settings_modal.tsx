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


import { Flex, Modal, Switch, Typography } from "antd";
import { useEffect, useState } from "react";
import {
  isBackgroundSyncEnabled,
  setBackgroundSyncEnabled,
} from "../services/settings_service";

export function SettingsModal(props: { isOpen: boolean; onDone: () => void }) {
  const [backgroundSyncEnabled, setBackgroundSyncEnabledState] =
    useState(false);

  useEffect(() => {
    if (props.isOpen) {
      setBackgroundSyncEnabledState(isBackgroundSyncEnabled());
    }
  }, [props.isOpen]);

  const handleToggle = (checked: boolean) => {
    setBackgroundSyncEnabled(checked);
    setBackgroundSyncEnabledState(checked);
  };

  return (
    <Modal
      centered
      closable={false}
      destroyOnHidden
      keyboard
      mask
      width={340}
      onCancel={props.onDone}
      onOk={props.onDone}
      open={props.isOpen}
      okText="Done"
      cancelButtonProps={{ style: { display: "none" } }}
    >
      <Flex vertical gap={10}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Settings
        </Typography.Title>
        <Flex align="center" justify="space-between" gap={10}>
          <Flex vertical style={{ maxWidth: 260 }}>
            <Typography.Text strong>Background sync</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Add and delete expenses instantly and sync in the background,
              even when offline.
            </Typography.Text>
          </Flex>
          <Switch checked={backgroundSyncEnabled} onChange={handleToggle} />
        </Flex>
      </Flex>
    </Modal>
  );
}
