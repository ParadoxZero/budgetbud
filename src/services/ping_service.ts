
const remote_domain: string = "https://budgetbud-service.azurewebsites.net";
const ping_endpoint: string = "/.auth/me";


export async function PingRemote(): Promise<Object> {
    try {
        const response = await fetch(remote_domain + ping_endpoint);
        return JSON.parse(await response.text());
    } catch (error) {
        return Promise.reject(error);
    }
}