/* 
 * BudgetBug - Budgeting and Expense Tracker with WebUI and API server
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

import { ExceptionOutlined, ExclamationCircleFilled, ExclamationOutlined, FileExclamationOutlined, LoadingOutlined } from "@ant-design/icons";
import { Alert, Button, Flex, message, Modal, Space, Spin, Typography } from "antd"
import { useEffect, useState } from "react"
import { GetShareKey } from "../services/share_service";


export function ShareBudgetModal(props: { isOpen: boolean, budget_id: string, onDone: () => void }) {
    let [share_key, setShareKey] = useState("");
    const [messageApi, contextHolder] = message.useMessage();
    useEffect(() => {setShareKey("")}, [props.budget_id]);

    if (props.isOpen && share_key.length == 0) {
        GetShareKey(props.budget_id).then((response) => { setShareKey(response.shareKey) })
        .catch(()=>{
            messageApi.error("Failed to create share code.", 5);
            props.onDone();
        });
    }

    return (
        <div>
            {contextHolder}
            <Modal
                loading={share_key.length == 0}
                centered
                closable={false}
                destroyOnClose
                keyboard
                mask
                width={300}
                maskClosable
                onClose={props.onDone}
                onOk={props.onDone}
                onCancel={props.onDone}
                footer={(
                    <Flex style={{ width: "100%" }} align="center" justify="center">
                        <Button type="primary" size="large" onClick={props.onDone}>Ok</Button>
                    </Flex>
                )}
                open={props.isOpen}>
                <Flex align="center" justify="center" vertical gap={10}>
                    <Flex gap={10}>
                        <ExclamationCircleFilled style={{ color: "#52c41a", fontSize:24 }} />
                        <Typography.Text>Use the following code to invite others to the budget: </Typography.Text>
                    </Flex>
                    <Typography.Text copyable style={{ fontSize: 24 }} code>{share_key}</Typography.Text>
                    <Space/>
                </Flex>
            </Modal>
        </div>
    )
}