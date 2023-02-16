import { Configuration, OpenAIApi } from "openai";
import { LazPlugin } from "../pluginSystem.plugin";
import { LazarusMessage } from "../types";
import { testInput1 } from "./inputs";

export default class PluginSystem extends LazPlugin {
  configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
  });
  openai = new OpenAIApi(this.configuration);
  contextsID = new Map<
    string,
    { parentMessageId?: string; conversationId?: string }
  >();
  constructor() {
    super();
  }
  currentContext = "";

  async onMessage(message: LazarusMessage): Promise<void> {
    if (message.text.split(" ")[0] === "#oai-clearcontext") {
      this.currentContext = "";
      this.handler!.sendTextMessage(message.conversation, "Context cleared");
      return;
    }
    if (message.text.split(" ")[0] === "#oai-context") {
      this.handler!.sendTextMessage(
        message.conversation,
        this.currentContext.length === 0 ? "No Context" : this.currentContext
      );
      return;
    }
    if (message.text.split(" ")[0] === "#oai") {
      const response = await this.openai.createCompletion({
        prompt:
          this.currentContext.length === 0
            ? testInput1.replace(
                "{{cliente}}",
                message.text.replace("#oai", "").trim()
              )
            : this.currentContext.replace(
                "{{cliente}}",
                message.text.replace("#oai", "").trim()
              ),
        model: "text-davinci-003",
        stop: ["Asistente:", "Cliente:"],
        max_tokens: 256,
      });
      this.handler!.sendTextMessage(
        message.conversation,
        response.data.choices[0].text!
      );
      this.currentContext =
        testInput1.replace(
          "{{cliente}}",
          message.text.replace("#oai", "").trim()
        ) +
        " " +
        response.data.choices[0].text! +
        `\nCliente: {{cliente}}\nAsistente:`;
    }
  }
}
