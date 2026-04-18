import { configureStore } from "@reduxjs/toolkit";
import { describe, it, expect, beforeEach } from "vitest";
import {
  navigationSlice,
  budgetSlice,
  syncSlice,
  headerSlice,
  View,
} from "../../store";
import { makeBudget } from "../mocks/fixtures";

function makeStore() {
  return configureStore({
    reducer: {
      navigation: navigationSlice.reducer,
      header: headerSlice.reducer,
      budget: budgetSlice.reducer,
      sync: syncSlice.reducer,
    },
  });
}

describe("navigationSlice", () => {
  it("starts at Overview", () => {
    const store = makeStore();
    expect(store.getState().navigation.current_view).toBe(View.Overview);
  });

  it("navigation action changes current_view", () => {
    const store = makeStore();
    store.dispatch(navigationSlice.actions.navigation(View.CategoryDetails));
    expect(store.getState().navigation.current_view).toBe(View.CategoryDetails);
  });

  it("to_category_view sets view and category id", () => {
    const store = makeStore();
    store.dispatch(navigationSlice.actions.to_category_view(7));
    const nav = store.getState().navigation;
    expect(nav.current_view).toBe(View.CategoryDetails);
    expect(nav.selected_category_id).toBe(7);
  });
});

describe("budgetSlice", () => {
  it("set replaces budget_list and index", () => {
    const store = makeStore();
    const b = makeBudget();
    store.dispatch(budgetSlice.actions.set({ budget_list: [b], selected_budget_index: 0 }));
    const state = store.getState().budget;
    expect(state.budget_list).toHaveLength(1);
    expect(state.selected_budget_index).toBe(0);
  });

  it("updateCurrent replaces the selected budget", () => {
    const store = makeStore();
    const b1 = makeBudget({ id: "b1", name: "Old" });
    const b2 = makeBudget({ id: "b1", name: "New" });
    store.dispatch(budgetSlice.actions.set({ budget_list: [b1], selected_budget_index: 0 }));
    store.dispatch(budgetSlice.actions.updateCurrent(b2));
    expect(store.getState().budget.budget_list[0].name).toBe("New");
  });

  it("updateSelection is a no-op when index is out of range", () => {
    const store = makeStore();
    store.dispatch(budgetSlice.actions.set({ budget_list: [makeBudget()], selected_budget_index: 0 }));
    store.dispatch(budgetSlice.actions.updateSelection({ index: 99 }));
    expect(store.getState().budget.selected_budget_index).toBe(0);
  });

  it("updateById updates the matching budget in the list", () => {
    const store = makeStore();
    const b = makeBudget({ id: "b1", name: "Before" });
    store.dispatch(budgetSlice.actions.set({ budget_list: [b], selected_budget_index: 0 }));
    store.dispatch(budgetSlice.actions.updateById({ budget_id: "b1", budget: { ...b, name: "After" } }));
    expect(store.getState().budget.budget_list[0].name).toBe("After");
  });

  it("clear resets to empty state", () => {
    const store = makeStore();
    store.dispatch(budgetSlice.actions.set({ budget_list: [makeBudget()], selected_budget_index: 0 }));
    store.dispatch(budgetSlice.actions.clear());
    const state = store.getState().budget;
    expect(state.budget_list).toHaveLength(0);
    expect(state.selected_budget_index).toBeNull();
  });
});

describe("syncSlice", () => {
  it("setPending updates pending_count", () => {
    const store = makeStore();
    store.dispatch(syncSlice.actions.setPending(3));
    expect(store.getState().sync.pending_count).toBe(3);
  });

  it("syncCompleted clears pending, error, and sets last_synced", () => {
    const store = makeStore();
    store.dispatch(syncSlice.actions.setPending(2));
    store.dispatch(syncSlice.actions.syncFailed());
    store.dispatch(syncSlice.actions.syncCompleted());
    const state = store.getState().sync;
    expect(state.pending_count).toBe(0);
    expect(state.has_error).toBe(false);
    expect(state.last_synced).toBeGreaterThan(0);
  });

  it("syncFailed sets has_error and clears is_syncing", () => {
    const store = makeStore();
    store.dispatch(syncSlice.actions.setSyncing(true));
    store.dispatch(syncSlice.actions.syncFailed());
    const state = store.getState().sync;
    expect(state.has_error).toBe(true);
    expect(state.is_syncing).toBe(false);
  });
});
