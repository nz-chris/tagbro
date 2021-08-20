const isProd = process.env.NODE_ENV === 'production';
!isProd && require('dotenv').config();

const Discord = require('discord.js');
const { Intents } = require('discord.js');
const pluralize = require('pluralize');

const { log, err } = require('../utils/logging');
const { getGuildNames, getHouses } = require('../utils/guilds');
const setUpCommands = require('../commands/setup');

module.exports = () => {
    global.isProd = isProd;

    global.bot = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

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

    bot.on('ready', () => {
        log('Bot ready.');
        log(`Connected to Guilds: ${getGuildNames()}.`);
        log(`Found ${pluralize('houses', getHouses().length, true)}.`);
        bot.user.setActivity('out for you.', { type: 'WATCHING' });

        setUpCommands().then(() => log('Commands set up.'));
    });
};
