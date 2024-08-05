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
        selected_category_id: null,
    },
    reducers: {
        navigation: (state, action) => {
            state.current_view = action.payload;
        },
        to_category_view: (state, action) => {
            state.current_view = View.CategoryDetails;
            state.selected_category_id = action.payload;
        }
    },
})

export const headerSlice = createSlice({
    name: 'header',
    initialState: {
        title: '',
        is_visible: false,
        show_title: false,
    },
    reducers: {
        header: (state, action) => {
            state.is_visible = action.payload.is_visible;
        },
        setTitle: (state, action) => {
            state.title = action.payload.title;
            state.show_title = action.payload.show_title;
        },
        showBudgetSelect: (state) => {
            state.title = '';
            state.show_title = false;
        }
    }
})

export const budgetSlice = createSlice({
    name: 'budget',
    initialState: {
        budget_list: [],
        selected_budget_index: null,
    } as any,
    reducers: {
        set: (state, action) => {
            state.budget_list = action.payload.budget_list;
            state.selected_budget_index = action.payload.selected_budget_index;
        },
        updateCurrent: (state, action) => {
            if (state.selected_budget_index == null) {
                return;
            }
            let budget_list = state.budget_list;
            budget_list[state.selected_budget_index] = action.payload;
            state.budget_list = budget_list;
        },
        updateSelection: (state, action) => {
            const new_index = action.payload.index;
            if (new_index < 0 || new_index >= state.budget_list.length) {
                return;
            }
            state.selected_budget_index = new_index;
        },
        clear: (state) => {
            state.budget_list = [];
            state.selected_budget_index = null;
        }
    }
})

// Action creators are generated for each case reducer function
export const { navigation: navigate, to_category_view } = navigationSlice.actions
const navigation_reducer = navigationSlice.reducer

export var store = configureStore({
    reducer: {
        navigation: navigation_reducer,
        header: headerSlice.reducer,
        budget: budgetSlice.reducer
    }
})

