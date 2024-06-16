import * as model from "./datamodel";

export interface Category extends model.Category {
    expenses: model.Expense[]
    history: model.CategoryLog[]
}

export interface Overview {
    user: model.User;
    categories: Category[]
    recurrings: model.Recurring[]
    specials: model.Special[]
}