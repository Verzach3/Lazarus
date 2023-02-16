import { MessageUpsertType, proto } from "@verzach3/baileys-edge";
import { startSock } from "./socket";
import { msgToLazarus } from "./util";
import MAIN_LOGGER from "./logger";
import LazarusHandler from "./lazarusHandler";
import { makeRedisStorage } from "./makeRedisStorage";
import { PluginSystem } from "./pluginSystem";
import { WebSocketServer } from "ws";
import dotenv from "dotenv"

dotenv.config();
const LazLogger = MAIN_LOGGER.child({});

// Set level to silent to disable logging
LazLogger.level = "trace";

async function main() {
  const sock = await startSock();
  const wss = new WebSocketServer({ port: 8080 });
  // const redisStorage = await makeRedisStorage();
  const pluginSystem = new PluginSystem(sock, "./dist/plugins");
  await pluginSystem.loadPlugins()
  // redisStorage.bind(sock.ev);
  // Handle new messages event
  handleWebsocket(wss, pluginSystem);
  sock.ev.on("messages.upsert", (arg) => handleMessages(arg, sock, pluginSystem));
}
function handleMessages(
  arg: {
    messages: proto.IWebMessageInfo[];
    type: MessageUpsertType;
  },
  socket: Awaited<ReturnType<typeof startSock>>,
  pluginSystem: PluginSystem
) {
  const { messages, type } = arg;
  if (type === "notify") {
    for (const msg of messages) {
      // Convert the message to a Lazarus message
      const lazmsg = msgToLazarus(msg, LazLogger);
      if (!lazmsg) {
        LazLogger.warn("Failed to convert message to Lazarus message");
        continue;
      }
      // Create a new handler for the message
      const handle = new LazarusHandler(lazmsg, socket, LazLogger);
      pluginSystem.next(lazmsg, handle);
      console.log(lazmsg);
      if(lazmsg.text === "#ping") {
        handle.sendTextMessage(lazmsg.conversation, "Pong!");
      }
      if (lazmsg.text === "#imgTest") {
        handle.sendImageMessage(lazmsg.conversation, "./assets/babymetroid.png");
      }
      if (lazmsg.text === "#reactTest") {
        handle.sendReaction(lazmsg.conversation, "👍", lazmsg.messageKey);
      }
      
      // Do something with the message
    }
  }
}

function handleWebsocket(wss: WebSocketServer, pluginSystem: PluginSystem) {
  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      console.log("Received message: %s", message);
    });
    ws.on("plugins:reload", () => {
      console.log("Reloading plugins");
      pluginSystem.reloadPlugins();
    })
  });
}

main().then(() => console.log("Done"));
