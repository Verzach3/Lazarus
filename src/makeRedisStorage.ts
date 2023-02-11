import {
  BaileysEventEmitter,
  Chat,
  ConnectionState,
  Contact,
  GroupMetadata,
  WAMessage,
  proto,
  updateMessageWithReaction,
  updateMessageWithReceipt,
} from "@verzach3/baileys-edge";
import { createClient } from "redis";
import { z } from "zod";

export async function makeRedisStorage() {
  const db = createClient();

  db.on("error", (err) => {
    console.log("Redis error: " + err);
  });

  await db.connect();

  async function createOnFallBack(key: string, path: string) {
      if ((await db.json.get(key, { path: path })) === null){
        await db.json.set(key, "$", {});
      }
  }

  const bind = async (ev: BaileysEventEmitter) => {
    if ((await db.json.objLen("messages")) === null) {
      await db.json.set("messages", "$", {});
    }
    if ((await db.json.objLen("messages")) === null) {
      await db.json.set("messages", "$", {});
    }

    if ((await db.json.objLen("chats")) === null) {
      await db.json.set("chats", "$", {});
    }
    if ((await db.json.objLen("contacts")) === null) {
      await db.json.set("contacts", "$", {});
    }

    if ((await db.json.objLen("presences")) === null) {
      await db.json.set("presences", "$", {});
    }
    if ((await db.json.objLen("groupMetadata")) === null) {
      await db.json.set("groupMetadata", "$", {});
    }

    ev.on("connection.update", async (update) => {
      await db.json.set("connection", "$", update as any);
    });

    ev.on(
      "messaging-history.set",
      async ({ chats, contacts, messages, isLatest }) => {
        if (isLatest) {
          await db.json.set("chats", "$", {});
          for (const id of messages) {
            try {
              await db.json.del("messages", `$.${id}`);
            } catch (error) {
              console.log("Error on messages.del", error);
            }
          }
        }

        for (const chat of chats) {
          try {
            await db.json.set("chats", `$.${chat.id}`, chat as any);
          } catch (error) {
            console.log("Error on chats.set", error);
          }
        }

        for (const contact of contacts) {
          try {
            await db.json.set(
              "contacts",
              `$.${contact.id.replace("@", "#")}`,
              contact as any
            );
          } catch (error) {
            console.log("Error on contacts.set", error);
          }
        }

        for (const message of messages) {
          try {
            await db.json.set(
              `messages:${message.key.remoteJid!.replace("@", "#")}`,
              `$.${message.key.remoteJid!.replace("@", "#")}`,
              message as any
            );
          } catch (error) {
            console.log("Error on messages.set", error);
          }
        }
      }
    );

    ev.on("contacts.update", async (contacts) => {
      try {
        for (const contact of contacts) {
          if (
            !(await db.json.get("contacts", {
              path: `$.${contact.id?.replace("@", "#")}`,
            }))
          ) {
            await db.json.set(
              "contacts",
              `$.${contact.id?.replace("@", "#")}`,
              contact as any
            );
          }
        }
      } catch (error) {
        console.log("Error on contacts.update", error);
      }
    });

    ev.on("chats.upsert", async (chats) => {
      for (const chat of chats) {
        try {
          await db.json.set(
            "chats",
            `$.${chat.id.replace("@", "#")}`,
            chat as any
          );
        } catch (error) {
          console.log("Error on chats.upsert", error);
        }
      }
    });

    ev.on("messages.upsert", async ({ messages, type }) => {
      for await (const message of messages) {
        await createOnFallBack(
          `messages:${message.key.remoteJid?.replace("@", "#")}`,
          `$.${message.key.id?.replace("@", "#")}`
        );
        try {
          await db.json.set(
            `messages:${message.key.remoteJid?.replace("@", "#")}`,
            `$.${message.key.id?.replace("@", "#")}`,
            message as {}
          );

          if (type === "notify") {
            try {
              await db.json.get("chats", {
                path: message.key.remoteJid?.replace("@", "#") || "",
              });
            } catch (error) {
              ev.emit("chats.upsert", [
                {
                  id: message.key.remoteJid || "",
                  conversationTimestamp: Number(message.messageTimestamp),
                  unreadCount: 1,
                },
              ]);
            }
          }
        } catch (error) {
          console.log("Error on messages.upsert", error);
        }
      }
    });

    ev.on("chats.update", async (chats) => {
      for (const update of chats) {
        let chat = await db.json.get("chats", {
          path: `$.${update.id?.replace("@", "#")}`,
        });
        if (!chat) {
          console.log("Error on chats.update, chat not found");
          continue;
        }
        console.log("chat", chat);

        let newChat = chat as unknown as Chat;
        newChat.unreadCount =
          (newChat.unreadCount || 0) + (update.unreadCount || 0);
        Object.assign(newChat, update);
        await db.json.set(
          "chats",
          `$.${update.id?.replace("@", "#")}`,
          newChat as {}
        );
      }
    });

    ev.on("presence.update", async (presence) => {
      try {
        await db.json.set(
          "presences",
          `$.${presence.id?.replace("@", "#")}`,
          presence as {}
        );
      } catch (error) {
        console.log("Error on presence.update", error);
      }
    });

    ev.on("chats.delete", async (chatsId) => {
      for (const id of chatsId) {
        try {
          await db.json.del("chats", `$.${id?.replace("@", "#")}`);
        } catch (error) {
          console.log("Error on chats.delete", error);
        }
      }
    });

    ev.on("groups.update", async (updates) => {
      for (const update of updates) {
        const id = update.id!;
        const metadata = await db.json.get("groupMetadata", {
          path: `$.${id?.replace("@", "#")}`,
        });
        if (!metadata) {
          console.log("Error on groups.update, group not found");
          continue;
        }

        let newMetadata = metadata as unknown as GroupMetadata;
        Object.assign(newMetadata, update);
        await db.json.set(
          "groupMetadata",
          `$.${id?.replace("@", "#")}`,
          newMetadata as {}
        );
      }
    });

    ev.on("group-participants.update", async ({ id, participants, action }) => {
      const metadata = (await db.json.get("groupMetadata", {
        path: `$.${id?.replace("@", "#")}`,
      })) as unknown as GroupMetadata;
      if (metadata === null) {
        return;
      }

      if (action === "add") {
        metadata.participants.push(
          ...participants.map((id) => ({
            id,
            isAdmin: false,
            isSuperAdmin: false,
          }))
        );
      }

      if (action === "remove") {
        metadata.participants = metadata.participants.filter(
          (p) => !participants.includes(p.id)
        );
      }

      if (action === "promote") {
        metadata.participants = metadata.participants.map((p) => {
          if (participants.includes(p.id)) {
            p.isAdmin = true;
          }
          return p;
        });
      }

      if (action === "demote") {
        metadata.participants = metadata.participants.map((p) => {
          if (participants.includes(p.id)) {
            p.isAdmin = false;
          }
          return p;
        });
      }

      await db.json.set(
        "groupMetadata",
        `$.${id?.replace("@", "#")}`,
        metadata as {}
      );
    });

    ev.on("message-receipt.update", async (updates) => {
      for (const { key, receipt } of updates) {
        const message = (await db.json.get(
          `messages:${key.remoteJid?.replace("@", "#")}`,
          {
            path: `$.${key.id?.replace("@", "#")}`,
          }
        )) as unknown as proto.IWebMessageInfo;

        if (!message) {
          console.log("Error on message-receipt.update, message not found");
          continue;
        }

        updateMessageWithReceipt(message, receipt);

        await db.json.set(
          `messages:${key.remoteJid?.replace("@", "#")}`,
          `$.${key.id?.replace("@", "#")}`,
          message as {}
        );
      }
    });

    ev.on("messages.reaction", async (reactions) => {
      for (const { key, reaction } of reactions) {
        const message = (await db.json.get(
          `messages:${key.remoteJid?.replace("@", "#")}`,
          { path: `$.${key.id?.replace("@", "#")}` }
        )) as unknown as proto.IWebMessageInfo;
        if (!message) {
          console.log("Error on messages.reaction, message not found");
        }

        updateMessageWithReaction(message, reaction);
        await db.json.set(
          `messages:${key.remoteJid?.replace("@", "#")}`,
          `$.${key.id?.replace("@", "#")}`,
          message as {}
        );
      }
    });
  }; // end bind

  return {
    bind,
    loadMessage: async (jid: string, id: string) => {
      return await db.json.get(`messages:${jid.replace("@", "#")}`, {
        path: `$.${id?.replace("@", "#")}`,
      });
    },
  };
}
