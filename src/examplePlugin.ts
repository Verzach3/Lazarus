import LazarusHandler from "./lazarusHandler";
import { LazPlugin } from "./pluginSystem.plugin";
import { LazarusMessage } from "./types";

export default class ExamplePlugin extends LazPlugin {
  constructor() {
    super();
  }

  async onMessage(message: LazarusMessage): Promise<void> {
      if(message.text === "ping") {
          await this.handler?.sendTextMessage(message.conversation, "pong");
      }
  }
}