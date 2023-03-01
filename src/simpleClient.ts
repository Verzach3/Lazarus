import {Client, LocalAuth} from "whatsapp-web.js";

export function SimpleClient() {
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: false,
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        }
    });

    return client;
}