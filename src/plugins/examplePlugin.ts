import { Plugin } from '../plugins';
export default function examplePlugin(): Plugin {
    return {
        name: "examplePlugin",
        author: "Verzach3",
        description: "This is an example plugin",
        version: "1.0.0",
        onInit: async (client, wsServer) => {
            console.log("Example plugin initialized !");
        },
        onMessage: async (message, client, wsServer) => {
            if (message.body.toLowerCase().split(" ")[0] === "!ping") {
                // client.sendMessage(message.from, "Pong!");
                message.reply("Pong!");
                wsServer?.broadcast("Pong! sended to " + message.from);
            }
        },
        onDestroy: async () => {
            console.log("Example plugin destroyed!");
        }
    }
}
