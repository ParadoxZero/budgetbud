import {localDataService} from "../services/local_data_service";
export function IsLoggedIn() {
    if (import.meta.env.MODE == "development") {
        localDataService.get("user") != null
    }
}
