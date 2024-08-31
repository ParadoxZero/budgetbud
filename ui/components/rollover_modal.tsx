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

import { Modal, Typography, message } from "antd";
import { RolloverBudget } from "../services/data_service";
import { useState } from "react";
import { budgetSlice, store } from "../store";

export function RolloverModal(props: { isOpen: boolean, budget_id: string, onDone: () => void, onClose: () => void }) {
    const [is_processing, setProcessing] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const on_rollover = () => {
        setProcessing(true);
        RolloverBudget(props.budget_id).then((budget) => {
            messageApi.success("Welcome to new month!", 5);
            store.dispatch(budgetSlice.actions.updateCurrent(budget));
        }).catch(() => {
            messageApi.error("Failed to rollover budget.", 5);
        }).finally(() => {
            props.onDone();
            setProcessing(false);
        });
    }
    return (
        <>
            {contextHolder}
            <Modal
                title="Finalize and proceed to next month's budget?"
                onOk={on_rollover}
                okButtonProps={{ loading: is_processing }}
                onCancel={props.onClose}
                okText="Rollover"
                cancelText="Cancel"
                centered
                closable={true}
                destroyOnClose
                keyboard
                mask
                maskClosable
                open={props.isOpen}
            >
                <Typography.Paragraph>
                    This will finalize current month and rollover the budget to the next month.
                </Typography.Paragraph>
            </Modal>
        </>
    )
}
