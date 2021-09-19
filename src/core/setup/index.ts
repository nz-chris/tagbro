const isProd = process.env.NODE_ENV === 'production';
import { config } from "dotenv";

isProd && config();

import Discord, { Intents } from 'discord.js';
import pluralize from 'pluralize';

import { err, log } from '../utils/logging';
import { getGuildNames, getHouses } from '../utils/guilds';
import setUpCommands from '../commands/setup';

export default () => {
    global.isProd = isProd;

    global.bot = new Discord.Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

    // To clear in teardown.
    global.intervals = new Set();

    const teardown = (e: Error) => {
        intervals.forEach(clearInterval);
        bot.destroy();
        log(`Bot destroyed due to ${e}.`);
        process.exit(1);
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
