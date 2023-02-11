import LazarusHandler from "./lazarusHandler";
import { LazarusMessage } from "./types";

export class LazPlugin {
  handler: LazarusHandler | undefined;
  constructor() {}

  async onMessage(message: LazarusMessage) {}

  async init() {
    
  }

  set setHandler(handler: LazarusHandler) {
    this.handler = handler;
  }
}
