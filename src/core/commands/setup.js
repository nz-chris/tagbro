const serverStats = require('../messages/serverStats');
const lastMatch = require('../messages/lastMatch');
const { err } = require('../utils/logging');

const commands = Object.freeze({
    ss: {
        name: 'ss',
        description: 'Get the stats for the Oceanic server.',
        getMessage: serverStats.getMessage,
    },
    lm: {
        name: 'lm',
        description: 'Get info on the last Oceanic pub.',
        getMessage: lastMatch.getMessage,
    },
});

const commandsData = Object.values(commands);

module.exports = async () => {
    if (isProd) {
        if (!bot.application?.owner) await bot.application?.fetch();
        bot.application.commands.set(commandsData).catch(err);
    } else {
        bot.guilds.cache.get(process.env.TEST_GUILD_ID)?.commands.set(commandsData).catch(err);
    }

    bot.on('interactionCreate', async (interaction) => {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;

        if (commands.hasOwnProperty(commandName)) {
            await interaction.deferReply();
            const response = await commands[commandName].getMessage() ?? 'IDK soz, something failed.';
            interaction.editReply({ content: response }).catch(err);
        }
    });
};
