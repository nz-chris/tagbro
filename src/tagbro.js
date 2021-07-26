const setup = require('./core/setup');
const constants = require('./core/constants');
const { updateMessageOnInterval } = require('./core/message-updating');

setup();

bot.on('ready', async () => {
    updateMessageOnInterval(constants.serverStatsMessagePrefix, 60_000);
    updateMessageOnInterval(constants.lastMatchMessagePrefix, 120_000);
});
