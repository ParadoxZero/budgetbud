import { DataModelFactory } from "./datamodel/datamodel";

export enum ScreenSize {
    mobile = 0,
    tablet = 1,
    desktop = 2
}

export function GetScreenSize(): ScreenSize {
    if (window.innerWidth <= 768) {
        return ScreenSize.mobile
    } else if (window.innerWidth <= 1024) {
        return ScreenSize.tablet
    } else {
        return ScreenSize.desktop
    }
}


export function CreateDummyData() {
    // Error if not development
    if (!import.meta.env.DEV) {
        throw new Error('PopulateDummpyContent function is only available in development mode');
    }
    // Create dummy data
    const user_data = DataModelFactory.createUserData();

    // Create dummy categories
    const categories = [
        "food",
        "travel",
        "clothes",
        "date night",
        "learning",
        "entertainment",
        "healthcare",
        "housing",
        "utilities",
        "transportation",
        "gifts",
        "miscellaneous"
    ];

    function getRandomAllocation() {
        // Generate a random allocation between 1000 and 5000
        return Math.floor(Math.random() * 4001) + 1000;
    }

    function getRandomExpense() {
        // Generate a random expense between 100 and 500
        return Math.floor(Math.random() * 401) + 100;
    }

    function generateRandomExpense() {
        return DataModelFactory.createExpense(1, last_cat_id, getRandomExpense());
    }

    let last_cat_id = 0;
    // Add random allocations to the categories
    for (const category in categories) {
        let user_category = DataModelFactory.createCategory(last_cat_id);
        user_category.allocation = getRandomAllocation();
        user_category.name = categories[category];
        user_category.description = "This is a dummy category";
        user_category.expenseList = Array.from({ length: Math.floor(Math.random() * 15) }, generateRandomExpense);
        last_cat_id++;
        user_data.categoryList.push(user_category);
    }

    return user_data;
}