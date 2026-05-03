# Category Type: List vs Single — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional `isSingleType` boolean to `Category` so categories can behave as a checkbox (one expense = full allocation) instead of a running expense list.

**Architecture:** Minimal data model change (one optional bool), a new presentational component `SingleCategoryCheckbox`, a new column in the edit-categories table, and conditional rendering in the overview. The expense list is used under the hood for both types — no structural change to expenses.

**Tech Stack:** React (class + functional components), TypeScript, Ant Design, Redux (dispatch only), existing `DataService` interface.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `ui/datamodel/datamodel.ts` | Modify | Add `isSingleType?: boolean` to `Category` and `GroupCategoryEditRow` |
| `ui/pages/edit_categories_page.tsx` | Modify | Carry `isSingleType` through `dataSource`; add Type switch column |
| `ui/components/single_category_checkbox.tsx` | Create | Presentational checkbox row for single-type categories |
| `ui/pages/overview.tsx` | Modify | Branch on `isSingleType`; add check/uncheck handlers |

---

## Task 1: Data Model Changes

**Files:**
- Modify: `ui/datamodel/datamodel.ts`

- [ ] **Step 1: Add `isSingleType` to `Category` interface**

In `ui/datamodel/datamodel.ts`, find the `Category` interface (line 67) and add the new field:

```typescript
export interface Category {
  id: number;
  name: string;
  description: string;
  allocation: number;
  isActive: boolean;
  lastUpdated: number;
  currency: string;
  expenseList: Expense[];
  isSingleType?: boolean;
}
```

- [ ] **Step 2: Add `isSingleType` to `GroupCategoryEditRow` interface**

Find `GroupCategoryEditRow` (line 128) and add the field:

```typescript
export interface GroupCategoryEditRow {
  row_key: number;
  id: number | null;
  title: string;
  amount: number;
  isSingleType?: boolean;
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npm run build
```

Expected: Build succeeds with no type errors.

- [ ] **Step 4: Commit**

```bash
git add ui/datamodel/datamodel.ts
git commit -m "feat: add isSingleType optional field to Category and GroupCategoryEditRow"
```

---

## Task 2: Edit Categories Page — Carry Type Through

**Files:**
- Modify: `ui/pages/edit_categories_page.tsx`

- [ ] **Step 1: Carry `isSingleType` when mapping categoryList to dataSource**

Find the `useEffect` (around line 105) and update the mapping:

```typescript
useEffect(() => {
  const initialData: GroupCategoryEditRow[] = budget.categoryList.map(
    (cat, index) => ({
      row_key: index,
      id: cat.id,
      title: cat.name,
      amount: cat.allocation,
      isSingleType: cat.isSingleType,
    }),
  );
  setDataSource(initialData);
}, [budget]);
```

- [ ] **Step 2: Add a Type column with a Switch**

Add `Switch` to the Ant Design imports at the top of the file:

```typescript
import {
  Table,
  Input,
  InputNumber,
  Popconfirm,
  Button,
  Flex,
  Switch,
  message,
} from "antd";
```

- [ ] **Step 3: Insert the Type column into the columns array**

In the `columns` array (around line 173), add a new column between "Amount" and "Operation":

```typescript
{
  title: "Type",
  dataIndex: "isSingleType",
  width: "20%",
  render: (_: any, record: GroupCategoryEditRow) => (
    <Switch
      checkedChildren="Single"
      unCheckedChildren="List"
      checked={record.isSingleType ?? false}
      onChange={(checked) =>
        handleRowChange(record.row_key, "isSingleType", checked)
      }
    />
  ),
},
```

Place this between the "Amount" column object and the "Operation" column object.

- [ ] **Step 4: Verify TypeScript compiles and the page renders**

```bash
npm run build
```

Expected: Build succeeds. Run `npm run dev` and navigate to Edit Categories — you should see a "Type" switch column defaulting to "List" for all existing categories.

- [ ] **Step 5: Commit**

```bash
git add ui/pages/edit_categories_page.tsx
git commit -m "feat: add category type switch (List/Single) to edit categories page"
```

---

## Task 3: New `SingleCategoryCheckbox` Component

**Files:**
- Create: `ui/components/single_category_checkbox.tsx`

- [ ] **Step 1: Create the component file**

Create `ui/components/single_category_checkbox.tsx` with this full content:

```typescript
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

import React from "react";
import { Button, Checkbox, Typography, Flex } from "antd";
import { RightOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface SingleCategoryCheckboxProps {
  id: number;
  title: string;
  total: number;
  isChecked: boolean;
  onCheck: () => void;
  onUncheck: () => void;
  onRightButtonClick: () => void;
}

const SingleCategoryCheckbox: React.FC<SingleCategoryCheckboxProps> = ({
  title,
  total,
  isChecked,
  onCheck,
  onUncheck,
  onRightButtonClick,
}) => {
  const handleChange = (e: { target: { checked: boolean } }) => {
    if (e.target.checked) {
      onCheck();
    } else {
      onUncheck();
    }
  };

  return (
    <div
      style={{
        margin: 0,
        marginTop: 10,
        marginBottom: 10,
        paddingRight: 20,
        paddingLeft: 20,
        minWidth: 300,
        opacity: isChecked ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={12}>
          <Checkbox
            checked={isChecked}
            onChange={handleChange}
            style={{ transform: "scale(1.3)", transformOrigin: "left center" }}
          />
          <Text
            strong
            type="secondary"
            style={{
              fontSize: 18,
              textDecoration: isChecked ? "line-through" : "none",
            }}
          >
            {title}
          </Text>
        </Flex>
        <Flex align="center" justify="right" gap={8}>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {total}
          </Text>
          <Button
            shape="circle"
            type="default"
            icon={<RightOutlined />}
            style={{ padding: 20, marginLeft: 12 }}
            onClick={onRightButtonClick}
          />
        </Flex>
      </Flex>
    </div>
  );
};

export default SingleCategoryCheckbox;
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add ui/components/single_category_checkbox.tsx
git commit -m "feat: add SingleCategoryCheckbox component for single-type categories"
```

---

## Task 4: Overview Integration

**Files:**
- Modify: `ui/pages/overview.tsx`

- [ ] **Step 1: Import `SingleCategoryCheckbox`**

Add the import near the top of `ui/pages/overview.tsx` with the other component imports:

```typescript
import SingleCategoryCheckbox from "../components/single_category_checkbox";
```

- [ ] **Step 2: Add `handle_single_category_check` method to `OverviewPage`**

Add this method to the `OverviewPage` class, after the existing `add_expense` method (around line 306):

```typescript
handle_single_category_check(category_id: number, category_name: string, allocation: number) {
  const budget = this.props.budget_list[this.props.selected_budget_index!];
  const expense = DataModelFactory.createExpense(0, category_id, allocation, category_name);
  this._data_service
    .updateExpense(budget.id, expense)
    .then((data) => {
      store.dispatch(budgetSlice.actions.updateCurrent(data));
    })
    .catch((e) => console.error("Failed to add single category expense", e));
}
```

- [ ] **Step 3: Add `handle_single_category_uncheck` method to `OverviewPage`**

Add this method directly after `handle_single_category_check`:

```typescript
handle_single_category_uncheck(category_id: number, expense_id: number) {
  const budget = this.props.budget_list[this.props.selected_budget_index!];
  this._data_service
    .deleteExpense(budget.id, category_id, expense_id)
    .then((data) => {
      store.dispatch(budgetSlice.actions.updateCurrent(data));
    })
    .catch((e) => console.error("Failed to remove single category expense", e));
}
```

- [ ] **Step 4: Update `render_catogory_list_row` to branch on `isSingleType`**

Find the `render_catogory_list_row` method (around line 396). Replace the full method with:

```typescript
render_catogory_list_row(
  category_id: number,
  title: string,
  value: number,
  total: number,
  isSingleType: boolean | undefined,
  expenseId: number | undefined,
) {
  if (isSingleType) {
    const isChecked = value > 0;
    return (
      <SingleCategoryCheckbox
        id={category_id}
        title={title}
        total={total}
        isChecked={isChecked}
        onCheck={() =>
          this.handle_single_category_check(category_id, title, total)
        }
        onUncheck={() =>
          this.handle_single_category_uncheck(category_id, expenseId!)
        }
        onRightButtonClick={() => store.dispatch(to_category_view(category_id))}
      />
    );
  }

  const add_expense_mode_context = this.state.add_expense_mode_context;
  if (
    add_expense_mode_context &&
    add_expense_mode_context.category_id === category_id
  ) {
    return this.render_add_single_category_expense();
  }
  return this.render_view_single_category(category_id, title, value, total);
}
```

- [ ] **Step 5: Update the call site in `render_categories` to pass `isSingleType` and `expenseId`**

Find the `render_categories` method (around line 440). Update the `categories.map` call:

```typescript
{categories.map((category) => (
  <div key={category.id} style={{ width: minWidth }}>
    {this.render_catogory_list_row(
      category.id,
      category.name,
      this.state.filled_allocations[category.id],
      category.allocation,
      category.isSingleType,
      category.expenseList[0]?.id,
    )}
    <Divider style={{ margin: 0, padding: 0 }} />
  </div>
))}
```

- [ ] **Step 6: Verify TypeScript compiles clean**

```bash
npm run build
```

Expected: Build succeeds with zero errors.

- [ ] **Step 7: Commit**

```bash
git add ui/pages/overview.tsx
git commit -m "feat: render SingleCategoryCheckbox for single-type categories in overview"
```

---

## Task 5: Manual Smoke Test

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Open the app in a browser at the URL shown (typically `http://localhost:5173`).

- [ ] **Step 2: Test setting a category to Single type**

Navigate to Overview → dropdown → Edit Categories. Find any category. Toggle its Type switch from "List" to "Single". Click "Save All Changes". Navigate back to Overview.

Expected: That category now shows a checkbox row instead of a progress bar.

- [ ] **Step 3: Test checking the category**

Click the checkbox for the single-type category.

Expected:
- The row dims to ~50% opacity
- The category title is struck through
- The budget remaining at the top decreases by the category's allocation amount

- [ ] **Step 4: Test unchecking the category**

Click the checkbox again to uncheck it.

Expected:
- Opacity returns to full
- Strike-through disappears
- Budget remaining increases back

- [ ] **Step 5: Test the right-arrow button on single-type category**

Click the `>` button on the single-type category row (whether checked or unchecked).

Expected: Navigates to the expense detail view for that category, showing 0 or 1 expense entry.

- [ ] **Step 6: Verify list-type categories are unaffected**

Check that all categories not toggled to Single still show the progress bar and click-to-add behavior exactly as before.

- [ ] **Step 7: Run lint**

```bash
npm run lint
```

Expected: Zero warnings or errors.
