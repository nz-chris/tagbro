const axios = require('axios');
const emojiRegex = require('emoji-regex');

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

const emojiCache = {};

module.exports = async () => {
    if (isProd) {
        if (!bot.application?.owner) await bot.application?.fetch();
        bot.application.commands.set(commandsData).catch(err);
    } else {
        bot.guilds.cache.get(process.env.TEST_GUILD_ID)?.commands.set(commandsData).catch(err);
    }

    // TODO move emoji kitchen stuff into its own file.
    bot.on('messageCreate', message => {
        const content = message.content.trim();

        if (!content.includes('+')) return;

        const emojiMatches = [...content.matchAll(emojiRegex())];

        if (
            emojiMatches.length !== 2 ||
            emojiMatches[0].index !== 0 ||
            emojiMatches[1].index + emojiMatches[1][0].length !== content.length ||
            emojiMatches.some(emoji => emoji[0].length > 3)
        ) return;

        const emojiCodes = emojiMatches.map(match => {
            const emoji = match[0];

            const codePart1 = `u${emoji.codePointAt(0).toString(16)}`;

            if (emoji.length < 3) return codePart1;

            const codePart2 = `u${emoji.codePointAt(2).toString(16)}`;

            return `${codePart1}-${codePart2}`;
        });

        const urlPrefixes = [20201001, 20210218, 20210521, 20210831, 20211115, 20220110, 20220203];
        const getAllPossibleUrls = (prefixIndex = 0, reverse = false, urls = []) => {
            if (prefixIndex === urlPrefixes.length) {
                return urls;
            }

            if (reverse) emojiCodes.reverse();

            urls.push(
                'https://www.gstatic.com/android/keyboard/emojikitchen/' +
                urlPrefixes[prefixIndex] +
                `/${emojiCodes[0]}/${emojiCodes[0]}_${emojiCodes[1]}.png`
            );

            return getAllPossibleUrls(prefixIndex + reverse, !reverse, urls);
        };

        const getUrl = () => new Promise((resolve, reject) => {
            const key = [...emojiCodes].sort();
            if (emojiCache[key]) {
                resolve(emojiCache[key]);
                return;
            }

            const urls = getAllPossibleUrls();
            for (const [i, url] of urls.entries()) {
                axios.get(url)
                    .then(() => {
                        resolve(url);
                        emojiCache[key] = url;
                    })
                    .catch(() => {
                        if (i === urls.length - 1) reject();
                    });
            }
        });

        getUrl()
            .then(url => {
                const embed = new Discord.MessageEmbed().setThumbnail(url);
                message.reply({ embeds: [embed] }).catch(err);
            })
            .catch(() => {
                // Unsupported emoji combo. Fail silently.
            });
    });

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
