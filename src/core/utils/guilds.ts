const { tagbrosHouse } = require('../constants');

module.exports = {
    getGuildNames: () => bot.guilds.cache.map(guild => `${guild.name} (${!guild.available ? `un` : ''}available)`),

    getHouses: () => {
        const houses = [];
        bot.guilds.cache.forEach(guild => {
            const house = guild.channels.cache.find(channel => (
                channel.viewable &&
                !channel.deleted &&
                channel.name === tagbrosHouse &&
                channel.type === 'GUILD_TEXT'
            ));
            if (house) houses.push(house);
        });
        return houses;
    },
};
