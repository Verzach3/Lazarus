import {LazPlugin} from "../pluginSystem.plugin" 
import { LazarusMessage } from "../types"
export default class GtpPlugin extends LazPlugin {
  OPENAI_KEY = process.env.OPENAI_KEY
  CHATGPT_KEY = process.env.CHATGPT_KEY
  contextsID = new Map<string, {parentMessageId?: string, conversationId?: string}>()
  api: any | undefined
  constructor() {
    super()
    if (!this.OPENAI_KEY) {
      throw new Error("OpenAI key not set")
    }
  }
  
  async init(): Promise<void> {
    const { ChatGPTAPI } = await import("chatgpt")
    this.api = new ChatGPTAPI({ 
      apiReverseProxyUrl: 'https://chatgpt.pawan.krd/api/completions',
      apiKey: this.CHATGPT_KEY!,
      completionParams: {
        model: "text-davinci-002-render"
      }
    })
  }

  async onMessage(message: LazarusMessage): Promise<void> {
    if (message.text.split(" ")[0] === "#gpt-clearcontext") {
      this.contextsID.delete(message.conversation+message.from)
      console.log("Cleared context", message.conversation+message.from);
      this.handler!.sendTextMessage(message.conversation, "Context cleared")
      return
    }
      if (message.text.split(" ")[0] ==="#gpt" ) {
        console.log("GPT");
        const response = await this.api.sendMessage(message.text.replace("#gpt", "").trim(), {
          parentMessageId: this.contextsID.get(message.conversation+message.from)?.parentMessageId,
          conversationId: this.contextsID.get(message.conversation+message.from)?.conversationId
        })
        this.contextsID.set(message.conversation+message.from, { parentMessageId: response.parentMessageId, conversationId: response.conversationId})
        console.log("Setted context", message.conversation+message.from);
        this.handler!.sendTextMessage(message.conversation, response.text)
         
      }

  }
}