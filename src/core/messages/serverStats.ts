const axios = require('axios');
const pluralize = require('pluralize');

const constants = require('../constants');
const { validateResponseData } = require('../data/validation');
const { err } = require('../utils/logging');

exports.getMessage = async () => {
    const url = `${constants.tpa}${constants.tpaStatsSuffix}`;
    let response;
    try {
        response = await axios.get(url);
    } catch (e) {
        err('Failed to get server stats.');
        err(e);
        return;
    }

    if (!validateResponseData(response, url, ['Oceania.ingame', 'Oceania.games', 'Oceania.matchmaking'])) return;

    const oceData = response.data.Oceania;

    return `**__${oceData.ingame}__** ${pluralize('players', oceData.ingame)} in ` +
        `**__${oceData.games}__** ${pluralize('games', oceData.games)} ` +
        `(**__${oceData.matchmaking}__** in matchmaking).`;
};
