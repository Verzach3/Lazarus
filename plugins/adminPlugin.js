"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: ()=>adminPlugin
});
function adminPlugin() {
    return {
        name: "Admin Plugin",
        version: "1.0.0",
        author: "Verzach3",
        description: "A plugin to manage the bot",
        onInit: async (_client, _ws)=>{
            console.log("Admin Plugin Loaded");
        },
        onDestroy: async ()=>{},
        onMessage: async (message, client, ws)=>{}
    };
}
