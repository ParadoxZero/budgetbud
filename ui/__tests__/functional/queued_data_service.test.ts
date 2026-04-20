import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { makeBudget, makeCategory, makeExpense, TEST_BUDGET_ID, TEST_CATEGORY_ID, TEST_EXPENSE_ID } from "../mocks/fixtures";
import { QueuedDataService } from "../../services/data_service";
import { store, budgetSlice, syncSlice } from "../../store";
import { clearQueue, getQueueSize } from "../../services/sync_queue";

// Prevent background sync from making real HTTP calls during tests
vi.mock("../../services/background_sync_service", () => ({
  backgroundSyncService: { triggerSync: vi.fn() },
}));

function seedStore(budget = makeBudget()) {
  store.dispatch(budgetSlice.actions.set({ budget_list: [budget], selected_budget_index: 0 }));
}

describe("QueuedDataService", () => {
  let svc: QueuedDataService;

  beforeEach(() => {
    clearQueue();
    store.dispatch(budgetSlice.actions.clear());
    store.dispatch(syncSlice.actions.setPending(0));
    svc = new QueuedDataService();
  });

  describe("updateExpense (optimistic)", () => {
    it("returns an optimistic budget immediately without waiting for network", async () => {
      const cat = makeCategory();
      const existing = makeExpense({ id: TEST_EXPENSE_ID });
      cat.expenseList = [existing];
      const budget = makeBudget({ id: TEST_BUDGET_ID, categoryList: [cat] });
      seedStore(budget);

      const updated = makeExpense({ id: TEST_EXPENSE_ID, amount: 999 });
      const result = await svc.updateExpense(TEST_BUDGET_ID, updated);

      const found = result.categoryList
        .find((c) => c.id === TEST_CATEGORY_ID)!
        .expenseList.find((e) => e.id === TEST_EXPENSE_ID);
      expect(found!.amount).toBe(999);
    });

    it("enqueues an ADD_EXPENSE operation", async () => {
      const cat = makeCategory();
      cat.expenseList = [makeExpense()];
      seedStore(makeBudget({ id: TEST_BUDGET_ID, categoryList: [cat] }));

      await svc.updateExpense(TEST_BUDGET_ID, makeExpense());
      expect(getQueueSize()).toBe(1);
    });

    it("increments pending_count in the sync slice", async () => {
      const cat = makeCategory();
      cat.expenseList = [makeExpense()];
      seedStore(makeBudget({ id: TEST_BUDGET_ID, categoryList: [cat] }));

      await svc.updateExpense(TEST_BUDGET_ID, makeExpense());
      expect(store.getState().sync.pending_count).toBe(1);
    });

    it("falls back to remote when budget is not in store", async () => {
      // Budget not in store → remote path via MSW handler
      server.use(
        http.post(`/api/Budget/${TEST_BUDGET_ID}/expense`, () =>
          HttpResponse.json(makeBudget()),
        ),
      );

      const result = await svc.updateExpense(TEST_BUDGET_ID, makeExpense());
      expect(result.id).toBe(TEST_BUDGET_ID);
    });
  });

  describe("deleteExpense (optimistic)", () => {
    it("removes the expense from the returned budget optimistically", async () => {
      const cat = makeCategory();
      cat.expenseList = [makeExpense({ id: TEST_EXPENSE_ID })];
      seedStore(makeBudget({ id: TEST_BUDGET_ID, categoryList: [cat] }));

      const result = await svc.deleteExpense(TEST_BUDGET_ID, TEST_CATEGORY_ID, TEST_EXPENSE_ID);

      const remaining = result.categoryList
        .find((c) => c.id === TEST_CATEGORY_ID)!
        .expenseList;
      expect(remaining).toHaveLength(0);
    });

    it("enqueues a DELETE_EXPENSE operation", async () => {
      const cat = makeCategory();
      cat.expenseList = [makeExpense()];
      seedStore(makeBudget({ id: TEST_BUDGET_ID, categoryList: [cat] }));

      await svc.deleteExpense(TEST_BUDGET_ID, TEST_CATEGORY_ID, TEST_EXPENSE_ID);
      expect(getQueueSize()).toBe(1);
    });
  });
});
