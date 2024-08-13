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

import { Button, Flex, Input, message, Modal, Typography } from "antd";
import { useState } from "react";
import { LinkBudget } from "../services/share_service";
import { InputStatus } from "antd/es/_util/statusUtils";

export function LinkBudgetModal(props: { isOpen: boolean, onDone: () => void, onClose: () => void }) {
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [validationStatus, setValidationStatus] = useState("");
    const [messageApi, contextHolder] = message.useMessage();

    const handle_ok = () => {
        setConfirmLoading(true);
        const code = (document.getElementById('share_code_id') as HTMLInputElement).value
        if (code.length == 0) {
            messageApi.error("Please enter the share code.", 5);
            setValidationStatus("error");
            setConfirmLoading(false);
            return;
        } 
        LinkBudget(code).then(() => {
            props.onDone();
            messageApi.error("Succesfully linked the budget.", 5);
        }).catch(()=>{
            messageApi.error("Failed to link budget.", 5);
        }).finally(() => {
            setConfirmLoading(false);
            props.onClose();
        });
       
    }
    let status: InputStatus = "";
    switch (validationStatus) {
        case "error":
            status = "error";
            break;
        case "warning":
            status = "warning";
            break;
    }
    return (
        <>
            {contextHolder}
            <Modal
                 centered
                 closable={true}
                 destroyOnClose
                 keyboard
                 mask
                 width={300}
                 maskClosable
                 confirmLoading={confirmLoading}
                 onCancel={props.onClose}
                 title="Link Budget"
                 footer={(
                     <Flex style={{ width: "100%" }} align="center" justify="center">
                         <Button type="primary" size="large" onClick={handle_ok}>Ok</Button>
                     </Flex>
                 )}
                 open={props.isOpen}>
                <Flex vertical align="center" justify="center">
                    <Typography.Paragraph>Linking budget will allow you to share the budget with others.</Typography.Paragraph>
                    <Input id="share_code_id" size="large" placeholder="Enter Share Code" status={status} />
                </Flex>
                </Modal>  
        </>
    );
}