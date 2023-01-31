import { proto } from "@verzach3/baileys-edge";
export interface LazarusMessage {
  messageKey: proto.IWebMessageKey;
  text: string;
  from: string;
  conversation: string;
  fromSelf: boolean;
}

// TODO: Add all message types
export type MessageType =
  | "imageMessage"
  | "conversation"
  | "stickerMessage"
  | "extendedTextMessage";
