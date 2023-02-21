import {Client, LocalAuth} from "whatsapp-web.js";

export function SimpleClient() {
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
        }
    });

    return client;
}