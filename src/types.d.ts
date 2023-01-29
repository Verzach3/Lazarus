export interface LazarusMessage {
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
