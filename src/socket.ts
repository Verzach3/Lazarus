import { MessageRetryMap } from "@verzach3/baileys-edge";
import MAIN_LOGGER from "./logger.js";
import { makeInMemoryStore } from "@verzach3/baileys-edge";
import makeWASocket from "@verzach3/baileys-edge";
import {
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from "@verzach3/baileys-edge";
import { Boom } from "@hapi/boom";
import { DisconnectReason } from "@verzach3/baileys-edge";
const logger = MAIN_LOGGER.child({});
// Set to "trace" to see the QR Code and more info
logger.level = "fatal";

const LazLogger = MAIN_LOGGER.child({});
LazLogger.level = "trace";

const msgRetryCounterMap: MessageRetryMap = {};
const store = makeInMemoryStore({ logger });

// Load store from file
store.readFromFile("./store.json");

// Save store to file every 10 seconds
setInterval(() => {
  store.writeToFile("./store.json");
}, 10_000);

export const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("baileys_auth_info");
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterMap,
    generateHighQualityLinkPreview: true,
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid!, key.id!);
        return msg?.message || undefined;
      }

      return {
        conversation: "Hello",
      };
    },
  });

  store.bind(sock.ev);

  // This function is called to handle the socket events
  sock.ev.process(async (events) => {
    if (events["connection.update"]) {
      const update = events["connection.update"];
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        if (
          (lastDisconnect?.error as Boom)?.output?.statusCode ===
          DisconnectReason.loggedOut
        ) {
          // TODO: Better way to handle socket restart
          startSock();
        } else {
          console.log("Conenction closed, you logged out");
        }
      }
    }

    if (events["creds.update"]) {
      await saveCreds();
    }

    // Handle messages
    if (events["messages.upsert"]) {
      // TODO: Remove this comments
      // const upsert = events["messages.upsert"];
      // // console.log("Received message", JSON.stringify(upsert, undefined, 2));

      // if (upsert.type === "notify") {
      //   for (const msg of upsert.messages) {
      //     // console.log(Object.keys(msg.message!))
      //     const lazmsg = msgToLazarus(msg, LazLogger);
      //     console.log(lazmsg);
      //     if (lazmsg) {
      //       const handle = new LazarusHandler(lazmsg, sock, LazLogger);
      //       if (lazmsg.text === "#imgTest") {
      //         handle.sendImageMessage(lazmsg.from, "./nonimage.jpg");
      //       }
      //     }
      //   }
      // }
    }
  });
  return sock;
};
