module.exports = {
    getGuildNames: () => bot.guilds.cache.map(guild => guild.name),

    getHouses: () => {
        const houses = [];
        bot.guilds.cache.forEach(guild => {
            const house = guild.channels.cache.find(channel => (
                channel.name === 'tagbros-house' && channel.type === 'text' && !channel.deleted
            ));
            house && houses.push(house);
        });
        return houses;
    },
};
