import { configureStore } from '@reduxjs/toolkit'

import { createSlice } from '@reduxjs/toolkit'

export enum View {
    Overview,
    CreateBudget,
    CategoryDetails,
    CategoryEdit,
    ExpenseDetails,
}

export const counterSlice = createSlice({
    name: 'navigation',
    initialState: {
        current_view: View.Overview,
        history: []
    },
    reducers: {
        navigation: (state, action) => {
            state.current_view = action.payload;
        }
    }
})

// Action creators are generated for each case reducer function
export const { navigation } = counterSlice.actions

const navigation_reducer = counterSlice.reducer

export var store = configureStore({
    reducer: {
        navigation: navigation_reducer
    }
})

