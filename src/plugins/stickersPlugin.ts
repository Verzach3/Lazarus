import { MessageMedia } from "whatsapp-web.js";
import { Plugin } from "../plugins";
export default function stickersPlugins(): Plugin {
  return {
    name: "stickersPlugin",
    version: "0.0.1",
    author: "Verzach3",
    description: "Plugin para crear stickers",
    onInit: async () => {},
    async onDestroy() {},
    async onMessage(message, client, wsServer) {
      const args = message.body.toLowerCase().split(" ");
      if (!(args[0] === "!sticker" || args[0] === "!st" || args[0] === "!stick")) return;
      if (message.hasMedia) {
        const media = await message.downloadMedia();
        if (media === undefined) {
          console.log(`Cannot download media on ${this.name} V${this.version}`);
          return
        }
        console.log("Message mime ", media.mimetype)
        if (media.mimetype === "image/jpeg" || media.mimetype === "image/png" || media.mimetype === "image/gif" || media.mimetype === "video/mp4") {
          const sticker = await client.sendMessage(message.from, media, {sendMediaAsSticker: true});
          if (sticker === undefined) {
            console.log(`Cannot send sticker on ${this.name} V${this.version}`);
            return
          }
          wsServer?.server.emit("plugin:stickersPlugin", "Sticker sended to " + message.from);
        }
      }

      if (message.hasQuotedMsg) {
        const quoted = await message.getQuotedMessage();
        if (quoted === undefined) {
          console.log(`Cannot get quoted message on ${this.name} V${this.version}`);
          return
        }
        console.log(JSON.stringify(quoted, null, 2))
        if (!quoted.hasMedia) {
          console.log(`Quoted message has no media on ${this.name} V${this.version}`);
          return
        }
        const media = await quoted.downloadMedia();
        if (media === undefined) {
          console.log(`Cannot download media on ${this.name} V${this.version}`);
          return
        }
        console.log("Message mime ", media.mimetype)
        if (media.mimetype === "image/jpeg" || media.mimetype === "image/png" || media.mimetype === "image/gif" || media.mimetype === "video/mp4") {
          const chat = await client.getChatById(message.from)
          const sticker = await client.sendMessage(message.from, media, {sendMediaAsSticker: true});
          if (sticker === undefined) {
            console.log(`Cannot send sticker on ${this.name} V${this.version}`);
            return
          }
          wsServer?.server.emit("plugin:stickersPlugin", "Sticker sended to " + message.from);
        }
      }
    },
  };
}
