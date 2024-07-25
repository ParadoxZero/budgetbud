import { DataModelFactory, RecurringType } from "./datamodel/datamodel";

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

export enum Status {
    success = 0,
    error = 1,
    warning = 2,
}

export function GetStatusFromPercent(percent: number): Status {
    if (percent > 90) {
        return Status.error;
    } else if (percent > 75) {
        return Status.warning;
    } else {
        return Status.success;
    }
}
export function CreateDummyData() {
    // Error if not development
    if (import.meta.env.VITE_CREATE_DUMMY_DATA !== 'true') {
        throw new Error('PopulateDummpyContent function is only available if dummy mode is enabled.');
    }
    // Create dummy data
    const user_data = DataModelFactory.createBudget();

    // Create dummy categories
    const categories = [
        "Food",
        "Travel",
        "Clothes",
        "Date night",
        "Learning",
        "Entertainment",
        "Healthcare",
        "Housing",
        "Utilities",
        "Transportation",
        "Gifts",
        "Miscellaneous"
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

    let recurring = DataModelFactory.createRecurring(0);
    recurring.amount = 1000;
    recurring.name = "Rent";
    recurring.description = "Monthly rent";
    recurring.isActive = true;
    recurring.lastUpdated = new Date();
    recurring.frequency = RecurringType.monthly;
    recurring.frequencey_unit = 1;

    if (Math.random() > 0.5) {
        user_data.recurringList.push(recurring);
    }

    return user_data;
}