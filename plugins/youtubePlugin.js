"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const youtubei_js_1 = require("youtubei.js");
const youtubei_js_2 = require("youtubei.js");
function youtubePlugin() {
    let yt;
    return {
        name: "Youtube Download",
        version: "1.0.0",
        author: "Verzach3",
        description: "A plugin to download music/video from Youtube",
        onInit: async (_client, _ws) => {
            yt = await youtubei_js_2.Innertube.create({
                cache: new youtubei_js_1.UniversalCache(false),
                generate_session_locally: true
            });
        },
        onDestroy: async () => { },
        onMessage: async (message, client, ws) => {
            if (message.body.split(" ")[0] === "!yt")
                return;
            console.log("Invoked");
            const id = message.body.split(" ")[1].split("=")[1];
            console.log(await yt.getBasicInfo(id));
        }
    };
}
exports.default = youtubePlugin;
