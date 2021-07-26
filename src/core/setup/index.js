process.env.NODE_ENV !== 'production' && require('dotenv').config();
const Discord = require('discord.js');
const pluralize = require('pluralize');


const { log, err } = require('../utils/logging');
const { getGuildNames, getHouses } = require('../utils/guilds');

module.exports = () => {
    global.bot = new Discord.Client();

    // To clear in teardown.
    global.intervals = new Set();

    const teardown = e => {
        intervals.forEach(clearInterval);
        bot.destroy();
        log(`Bot destroyed due to ${e}.`);
    };
    ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach(e => process.on(e, teardown));

    bot.login(process.env.BOT_TOKEN).catch(e => {
        err(e);
        process.exit();
    });

    bot.on('ready', async () => {
        log('Bot ready.');
        log(`Connected to Guilds: ${getGuildNames()}.`);
        log(`Found ${pluralize('houses', getHouses().length, true)}.`);
        bot.user.setActivity('out for you.', { type: 'WATCHING' })
            .then(() => log('Activity set.'))
            .catch(err);
    });
};
