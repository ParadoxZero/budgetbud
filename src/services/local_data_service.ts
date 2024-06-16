class LocalDataService{

    public save(key: string, value: any){
        localStorage.setItem(key, JSON.stringify(value));
    }

    public get(key: string): any {
        return JSON.parse(localStorage.getItem(key) || '{}');
    }
}

export const localDataService = new LocalDataService()