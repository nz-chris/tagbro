import setUp from "./core/setup";
import constants from "./core/constants";
import { updateMessageOnInterval } from "./core/message-updating";

setUp();

global.bot.on('ready', () => {
    updateMessageOnInterval(constants.serverStatsMessagePrefix, 1);
    updateMessageOnInterval(constants.lastMatchMessagePrefix, 2);
});
