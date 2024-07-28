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
        is_visible: true,
        budget_list: []
    },
    reducers: {
        header: (state, action) => {
            state.title = action.payload;
        }
    }
})

// Action creators are generated for each case reducer function
export const { navigation } = navigationSlice.actions

const navigation_reducer = navigationSlice.reducer

export var store = configureStore({
    reducer: {
        navigation: navigation_reducer,
        header: headerSlice.reducer
    }
})

