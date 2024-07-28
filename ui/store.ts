import { configureStore } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'


export enum View {
    Overview,
    NoBudgetAvailable,
    CategoryDetails,
    CategoryEdit,
    ExpenseDetails,
}

export const navigationSlice = createSlice({
    name: 'navigation',
    initialState: {
        current_view: View.Overview,
    },
    reducers: {
        navigation: (state, action) => {
            console.log(action);
            state.current_view = action.payload;
        }
    },
})

export const headerSlice = createSlice({
    name: 'header',
    initialState: {
        title: 'BudgetBud',
        is_visible: false,
    },
    reducers: {
        header: (state, action) => {
            state.title = action.payload.title;
            state.is_visible = action.payload.is_visible;
        }
    }
})

export const budgetSlice = createSlice({
    name: 'budget',
    initialState: {
        budget_list: [],
        selected_budget_index: null
    } as any,
    reducers: {
        budget: (state, action) => {
            state.budget_list = action.payload.budget_list;
            state.selected_budget_index = action.payload.selected_budget_index;
        },
        upadteBudget: (state, action) => {
            if (state.selected_budget_index == null) {
                return;
            }
            state.budget_list[state.selected_budget_index] = action.payload.budget;
        }
    }
})

// Action creators are generated for each case reducer function
export const { navigation } = navigationSlice.actions
const navigation_reducer = navigationSlice.reducer

export var store = configureStore({
    reducer: {
        navigation: navigation_reducer,
        header: headerSlice.reducer,
        budget: budgetSlice.reducer
    }
})

