import { describe, it, expect, beforeEach } from "vitest";
import {
  enqueueOperation,
  removeOperation,
  getAllOperations,
  getQueueSize,
  clearQueue,
} from "../../services/sync_queue";
import type { Expense } from "../../datamodel/datamodel";
import { makeExpense, TEST_BUDGET_ID } from "../mocks/fixtures";

function makeAddOp(expense: Expense = makeExpense()) {
  return {
    type: "ADD_EXPENSE" as const,
    budget_id: TEST_BUDGET_ID,
    payload: { expense },
  };
}

describe("sync_queue", () => {
  beforeEach(() => clearQueue());

  it("enqueueOperation adds an operation with generated id and timestamp", () => {
    const op = enqueueOperation(makeAddOp());
    expect(op.id).toBeTruthy();
    expect(op.timestamp).toBeGreaterThan(0);
    expect(getQueueSize()).toBe(1);
  });

  it("enqueueOperation preserves insertion order", () => {
    const e1 = makeExpense({ id: 1 });
    const e2 = makeExpense({ id: 2 });
    enqueueOperation(makeAddOp(e1));
    enqueueOperation(makeAddOp(e2));
    const ops = getAllOperations();
    expect((ops[0].payload as any).expense.id).toBe(1);
    expect((ops[1].payload as any).expense.id).toBe(2);
  });

  it("removeOperation removes only the matching entry", () => {
    const op1 = enqueueOperation(makeAddOp(makeExpense({ id: 1 })));
    const op2 = enqueueOperation(makeAddOp(makeExpense({ id: 2 })));
    removeOperation(op1.id);
    expect(getQueueSize()).toBe(1);
    expect(getAllOperations()[0].id).toBe(op2.id);
  });

  it("getQueueSize returns 0 after clearQueue", () => {
    enqueueOperation(makeAddOp());
    enqueueOperation(makeAddOp());
    clearQueue();
    expect(getQueueSize()).toBe(0);
  });

  it("getAllOperations returns empty array when queue is empty", () => {
    expect(getAllOperations()).toEqual([]);
  });
});
