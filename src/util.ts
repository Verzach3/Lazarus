import { MessageType, proto } from "@verzach3/baileys-edge";
import { LazarusMessage } from "./types";
import { z } from "zod";
import { Logger } from "pino";

/**
 * A function that converts a proto.IWebMessageInfo to a Lazarus message
 * @param msg {proto.IWebMessageInfo}
 */
export function msgToLazarus(msg: proto.IWebMessageInfo, logger: Logger): LazarusMessage | null {
  const isGroup = msg.key.remoteJid!.includes("@g.us");
  const from = isGroup ? msg.participant : msg.key.remoteJid;
  const type = getMessageType(msg);
  if (!type) {
    logger.warn("msgToLazarus: Unknown message type, returning null");
    return null;
  }
  logger.info(`msgToLazarus: Message type: ${type}`)
  console.log(type);
  return {
    text:
      (msg.message?.conversation || msg.message?.extendedTextMessage?.text) ??
      "",
    from: from ?? "",
    conversation: msg.key.remoteJid ?? "",
    fromSelf: msg.key.fromMe ?? false,
  };
}

// This function check the type at runtime, validating the type of the message
const messageTypes = z.union([
  z.literal("imageMessage"),
  z.literal("conversation"),
  z.literal("stickerMessage"),
  z.literal("extendedTextMessage"),
]);
function getMessageType(msg: proto.IWebMessageInfo): MessageType | null {
  const type = Object.keys(msg.message ?? {})[0];
  const res = messageTypes.safeParse(type);
  if (res.success) {
    return res.data;
  }

  return null;
}
