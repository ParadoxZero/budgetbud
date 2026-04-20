import { http, HttpResponse } from "msw";
import { makeBudget } from "./fixtures";

export const handlers = [
  http.get("/api/Budget", () => {
    return HttpResponse.json([makeBudget()]);
  }),

  http.post("/api/Budget", async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json(makeBudget({ name: body.name }));
  }),

  http.delete("/api/Budget/:budgetId", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  http.post("/api/Budget/:budgetId/expense", async ({ request }) => {
    const expense = await request.json();
    const budget = makeBudget();
    return HttpResponse.json({ ...budget, categoryList: [] });
  }),

  http.put("/api/Budget/:budgetId/expense/:expenseId", async ({ request }) => {
    const expense = await request.json();
    const budget = makeBudget();
    return HttpResponse.json(budget);
  }),
];
