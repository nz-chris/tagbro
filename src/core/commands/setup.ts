import serverStats from "../messages/serverStats";
import lastMatch from "../messages/lastMatch";
import { err } from "../utils/logging";


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

export default async () => {
    const handleSetCommandsError = (e: Error) => {
        err('Failed to set commands', e);
        process.exit(1);
    };

    if (isProd) {
        if (!bot.application?.owner) await bot.application?.fetch();
        bot.application.commands.set(commandsData).catch(handleSetCommandsError);
    } else {
        bot.guilds.cache.get(process.env.TEST_GUILD_ID)?.commands.set(commandsData).catch(handleSetCommandsError);
    }

    bot.on('interactionCreate', async (command) => {
        if (!command.isCommand()) return;

        const { commandName } = command;
        await command.deferReply();
        const response = await commands[commandName].getMessage() ?? 'IDK soz, something failed.';
        command.editReply({ content: response }).catch(e => {
            err('Failed to edit command reply', e);
        });
    });
};
