# Category Type: List vs Single

**Date:** 2026-05-03  
**Status:** Approved

## Overview

Add a "type" concept to categories. A category is either **list** (current behavior — multiple expense entries) or **single** (a checkbox: checking it records the full allocation as one expense, unchecking removes it). The only data model change is one optional boolean on `Category`.

---

## Data Model

**File:** `ui/datamodel/datamodel.ts`

Add `isSingleType?: boolean` to `Category`:

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
  isSingleType?: boolean;  // undefined or false = list, true = single
}
```

Add `isSingleType?: boolean` to `GroupCategoryEditRow`:

```typescript
export interface GroupCategoryEditRow {
  row_key: number;
  id: number | null;
  title: string;
  amount: number;
  isSingleType?: boolean;
}
```

`DataModelFactory.createCategory` is unchanged — `isSingleType` defaults to `undefined` (list behavior).

---

## Edit Categories Page

**File:** `ui/pages/edit_categories_page.tsx`

- The `useEffect` that maps `budget.categoryList` to `dataSource` carries `isSingleType` through.
- `handleRowChange` already handles any field generically — no change needed.
- A new "Type" column is added to the table between "Amount" and "Operation", using an Ant Design `Switch`:
  - Off = List (default), On = Single
  - Label reads "List" or "Single" based on switch state.
- `bulkUpdateCategories` sends the full row; `isSingleType` passes through transparently.

---

## New Component: `SingleCategoryCheckbox`

**File:** `ui/components/single_category_checkbox.tsx`

Props:
```typescript
interface SingleCategoryCheckboxProps {
  id: number;
  title: string;
  total: number;          // allocation amount
  isChecked: boolean;     // derived: category.expenseList.length > 0
  onCheck: () => void;
  onUncheck: () => void;
  onRightButtonClick: () => void;
}
```

Layout mirrors `SingleCategory` — same outer div padding/margins so the overview grid stays consistent.

- **Left:** Ant Design `Checkbox` (large) + category title
- **Right:** allocation amount + `RightOutlined` button (navigates to expense detail view)
- **Unchecked state:** normal opacity, normal title style
- **Checked state:** `text-decoration: line-through` and `opacity: 0.5` on the whole row content; checkbox remains fully interactive to allow unchecking

The component is purely presentational — no data service calls inside it.

---

## Overview Integration

**File:** `ui/pages/overview.tsx`

`render_catogory_list_row` is updated:

```
if category.isSingleType:
    isChecked = category.expenseList.length > 0
    render SingleCategoryCheckbox with:
        onCheck  → addExpense(categoryId, categoryName, allocation)
        onUncheck → deleteExpense(expenseList[0].id)
else:
    existing list behavior (unchanged)
```

- `onCheck` calls `_data_service.updateExpense(budget.id, DataModelFactory.createExpense(0, category.id, category.allocation, category.name))`, then dispatches updated budget to Redux.
- `onUncheck` calls `_data_service.deleteExpense(budget.id, category.expenseList[0].id)`, then dispatches updated budget.
- Single-type categories are excluded from `add_expense_mode_context` — clicking the row does nothing; all interaction is via the checkbox.
- `filled_allocations` calculation is unchanged — it sums `expenseList` amounts, so a checked single category correctly counts as fully used in the budget total.

---

## Files Changed

| File | Change |
|------|--------|
| `ui/datamodel/datamodel.ts` | Add `isSingleType?: boolean` to `Category` and `GroupCategoryEditRow` |
| `ui/pages/edit_categories_page.tsx` | Carry `isSingleType` in `dataSource`; add Type switch column |
| `ui/components/single_category_checkbox.tsx` | New component |
| `ui/pages/overview.tsx` | Branch on `isSingleType` in `render_catogory_list_row`; add check/uncheck handlers |

---

## What Does Not Change

- `Expense` interface — no modifications
- Backend / API — `isSingleType` passes through Cosmos DB as-is (schema-less)
- `view_expense_page.tsx` — single-type categories still have an expense list view (accessible via the `RightOutlined` button), which works correctly since there is always 0 or 1 expense
- `all_expenses_page.tsx` — no changes; the single expense entry appears normally in the all-expenses table
