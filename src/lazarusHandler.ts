import makeWASocket, {AnyMessageContent, proto } from "@verzach3/baileys-edge";
import { LazarusMessage } from "./types";
import { SafeURL } from "./decorators/safe";
import { Logger } from "pino";

// TODO:
export default class LazarusHandler {
  msg: LazarusMessage;
  socket: ReturnType<typeof makeWASocket>;
  constructor(msg: LazarusMessage, socket: ReturnType<typeof makeWASocket>, logger:Logger) {
    this.msg = msg;
    this.socket = socket;
  }

  async sendRawMessage(jid: string, content: AnyMessageContent) {
    await this.socket.sendMessage(jid, content);
  }

  async sendTextMessage(jid: string, text: string) {
    await this.sendRawMessage(jid, {text: text});
  }

  @SafeURL()
  async sendImageMessage(jid: string, url: string, caption?: string) {
    await this.sendRawMessage(jid, {image: {url: url}, caption: caption});
  }

  async sendReaction(jid: string, reaction: string, messageKey: proto.IMessageKey) {
    if (!messageKey) throw new Error("Message key is required for reactions")
    await this.sendRawMessage(jid, {react: {text: reaction, key: messageKey }});
  }
}
