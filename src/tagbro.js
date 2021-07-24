const botToken = process.env.NODE_ENV === 'production' ? process.env.BOT_TOKEN : process.argv[2];

const Discord = require('discord.js');
const axios = require('axios').default;
const pluralize = require('pluralize');

const constants = require('./core/constants');
const { log, err } = require('./core/utils/logging');


const bot = new Discord.Client();
let interval;
const teardown = e => {
    clearInterval(interval);
    bot.destroy();
    log(`Bot destroyed due to ${e}.`);
};
['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'].forEach(e => process.on(e, teardown));
bot.login(botToken).catch(e => {
    err(e);
    process.exit();
});


bot.on('ready', () => {
    log('Bot ready.');
    log(`Connected to Guilds: ${bot.guilds.cache.map(guild => guild.name)}.`);
    bot.user.setActivity('out for you.', { type: 'WATCHING' })
        .then(() => log('Activity set.'))
        .catch(err);

    log(`Found ${pluralize('houses', getHouses().length, true)}.`);

    const doStuff = async () => {
        const houses = getHouses();
        if (!houses.length) return;
        const updatedMessage = await getNewStatsMessageContent();
        if (!updatedMessage) return;
        houses.forEach(house => {
            getExistingStatsMessage(house).then(existingMessage => {
                if (existingMessage) existingMessage.edit(updatedMessage).catch(err);
                else house.send(updatedMessage).catch(err);
            });
        });
    };

    doStuff().then(() => {
        interval = setInterval(doStuff, 60_000);
    });
});


const getHouses = () => {
    const houses = [];
    bot.guilds.cache.forEach(guild => {
        const house = guild.channels.cache.find(channel => (
            channel.name === 'tagbros-house' && channel.type === 'text' && !channel.deleted
        ));
        house && houses.push(house);
    });
    return houses;
};

const getStatsData = async () => {
    try {
        const response = await axios.get(`${constants.tpa}stats`);
        return response.data;
    } catch (e) {
        err('Failed to get server stats.');
        err(e);
    }
};

const getExistingStatsMessage = house => new Promise(resolve => {
    const filter = message => (
        message.author.id === bot.user.id &&
        message.content.startsWith(constants.serverStatsMessagePrefix) &&
        !message.deleted
    );
    const statsMessage = house.messages.cache.find(filter);
    if (statsMessage) resolve(statsMessage);
    else house.messages.fetch().then(collected => {
        collected = collected.filter(filter);
        resolve(collected.first());
    });
});

const getNewStatsMessageContent = async () => {
    const data = await getStatsData();
    if (!data) return;
    const oceData = data.Oceania;
    return constants.serverStatsMessagePrefix +
        `${pluralize('players', oceData.ingame, true)} in ` +
        `${pluralize('games', oceData.games, true)} ` +
        `(${oceData.matchmaking} in matchmaking).` +
        `\n*updated each minute*`;
};
