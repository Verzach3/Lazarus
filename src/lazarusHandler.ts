import makeWASocket, { AnyMessageContent } from "@verzach3/baileys-edge";
import { LazarusMessage } from "./types";
import { SafeURL } from "./decorators/safe";
import { Logger } from "pino";

export default class LazarusHandler {
  msg: LazarusMessage;
  socket: ReturnType<typeof makeWASocket>;
  constructor(msg: LazarusMessage, socket: ReturnType<typeof makeWASocket>, logger:Logger) {
    this.msg = msg;
    this.socket = socket;
  }

  async sendRawMessage(jid: string, content: AnyMessageContent) {
    this.socket.sendMessage(jid, content);
  }

  async sendTextMessage(jid: string, text: string) {
    this.socket.sendMessage(jid, { text: text });
  }

  @SafeURL()
  async sendImageMessage(jid: string, url: string, caption?: string) {
    this.socket.sendMessage(jid, { image: { url: url }, caption: caption });
  }
}
