const setUp = require('./core/setup');
const constants = require('./core/constants');
const { updateMessageOnInterval } = require('./core/message-updating');

setUp();

bot.on('ready', () => {
    updateMessageOnInterval(constants.serverStatsMessagePrefix, 1);
    updateMessageOnInterval(constants.lastMatchMessagePrefix, 2);
});
