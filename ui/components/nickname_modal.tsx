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

import {
  Flex,
  Input,
  message,
  Modal,
  Space,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import {GetUserDetails, UpdateUserNickname} from "../services/user_service";

export function NicknameModal(props: {
  isOpen: boolean;
  onDone: () => void;
}) {
  let [nickname, setNickname] = useState("");
  const [messageApi, contextHolder] = message.useMessage();

  let [isLoading, setIsLoading] = useState(true);
  let [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNickname("");
    setIsLoading(true);
    setIsSubmitting(false);
  }, [props.isOpen]);

  if (props.isOpen && nickname.length == 0) {
    GetUserDetails()
      .then((response) => {
        setNickname(response.nickName);
        setIsLoading(false);
      })
      .catch(() => {
        messageApi.error("Failed to get user details.", 5);
        props.onDone();
      });
  }

  const handleOK = () => {
          setIsSubmitting(true);
          UpdateUserNickname(nickname)
            .then(() => {
              messageApi.success("Nickname updated successfully.", 5);
              props.onDone();
            })
            .catch(() => {
              messageApi.error("Failed to update nickname.", 5);
              setIsSubmitting(false);
              setNickname('');
            });
        };

  return (
    <div>
      {contextHolder}
      <Modal
        loading={isLoading}
        centered
        closable={false}
        destroyOnHidden
        keyboard
        mask
        width={300}
        maskClosable={!isSubmitting}
        onOk={handleOK}
        onCancel={props.onDone}
        open={props.isOpen}
        okText="Update"
        okButtonProps={{ loading: isSubmitting }}
        cancelText="Cancel"
      >
        <Flex align="center" justify="center" vertical gap={10}>
          <Flex gap={10}>
            <Typography.Text>
              Edit your nickname..
            </Typography.Text>
          </Flex>
          <Input value={nickname} onChange={(e) => setNickname(e.target.value)}
          disabled={isSubmitting}
          />
          <Space />
        </Flex>
      </Modal>
    </div>
  );
}
