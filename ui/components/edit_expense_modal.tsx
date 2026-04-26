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

import React from "react";
import { Expense } from "../datamodel/datamodel";
import { budgetSlice, store } from "../store";
import { getDataService } from "../services/data_service";
import { ExpenseDetailsModal } from "./expense_details_modal";

export interface EditExpenseModalProps {
  editingExpense: { id: number; title: string; amount: number; categoryId: number; timestamp: number } | null;
  categories: { id: number; name: string }[];
  budgetId: string;
  defaultCategoryId: number;
  onClose: () => void;
  onLoadingChange: (loading: boolean) => void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  editingExpense,
  categories,
  budgetId,
  defaultCategoryId,
  onClose,
  onLoadingChange,
}) => {
  const dataService = getDataService();
  return (
    <ExpenseDetailsModal
      isOpen={editingExpense !== null}
      categories={categories}
      defaultCategoryId={editingExpense?.categoryId ?? defaultCategoryId}
      defaultAmount={editingExpense?.amount ?? 0}
      defaultTitle={editingExpense?.title}
      modalTitle="Edit Expense"
      submitLabel="Save"
      onClose={onClose}
      onSubmit={(title, amount, categoryId) => {
        if (!editingExpense) return;
        const expense: Expense = {
          id: editingExpense.id,
          categoryId,
          amount,
          title,
          addedBy: "",
          timestamp: editingExpense.timestamp,
        };
        onLoadingChange(true);
        dataService
          .editExpense(budgetId, expense)
          .then((budget) => {
            store.dispatch(budgetSlice.actions.updateCurrent(budget));
          })
          .finally(() => {
            onLoadingChange(false);
          });
        onClose();
      }}
    />
  );
};
