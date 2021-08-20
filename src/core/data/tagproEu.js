const axios = require('axios');
const { JSDOM } = require('jsdom');
const { range } = require('lodash');

const { err } = require('../utils/logging');
const constants = require('../constants');
const { validateResponseData } = require('./validation');

exports.getLatestPubId = () => new Promise(async resolve => {
    const maxPages = 10;
    for (let page of range(maxPages)) {
        page += 1;
        let matchesResponse;
        try {
            matchesResponse = await axios.get(`${constants.eua}${constants.euaSydneyMatchesSuffix}${page}`);
        } catch (e) {
            err('Failed to get matches page.');
            err(e);
            return;
        }

        const dom = new JSDOM(matchesResponse.data);
        const tbody = dom.window.document.body.querySelector('tbody');
        const rows = [...tbody.rows];
        const firstPubRow = rows.find(row => row.querySelector('td.matches-public'));
        if (firstPubRow) resolve(firstPubRow.cells[0].textContent.slice(1));
        else if (page === maxPages) {
            err(`Failed to find a public match id within ${maxPages} pages.`)
            resolve();
        }
    }
});

exports.getMatchData = async (matchId) => {
    const matchUrl = `${constants.eua}${constants.euaMatchDataSuffix}${matchId}`;

    let matchResponse;
    try {
        matchResponse = await axios.get(matchUrl);
    } catch (e) {
        err(`Failed to get match response for id ${matchId}.`);
        err(e);
        return;
    }

    if (!validateResponseData(matchResponse, matchUrl, ['duration', 'date', 'players'])) {
        return;
    }

    const { data } = matchResponse;

    data.id = matchId;

    return data;
};

exports.getMatchTimeStampString = matchData => `<t:${Math.round(matchData.date + matchData.duration / 60)}:R>`;

exports.getMatchDurationString = matchData => {
    const hhmmssDuration = new Date(matchData.duration / 60 * 1_000).toISOString().substr(11, 8);
    return hhmmssDuration.slice(hhmmssDuration.match(/[1-9]/).index);
};

exports.getPlayers = async (matchData) => {
    // Get subs
    const matchHtmlResponse = await axios.get(`${constants.eua}${constants.euaMatchSuffix}${matchData.id}`);
    const dom = new JSDOM(matchHtmlResponse.data);
    const tbody = dom.window.document.body.querySelector('tbody');
    const subsRow = [...tbody.rows].find(row => row.querySelector('th')?.textContent === 'Substitutes');
    const [redSubs, blueSubs] = [...subsRow.querySelectorAll('td')]
        .map(cell => {
            const players = [];
            let currentPlayer = {};
            [...cell.childNodes].forEach(node => {
                if (node.nodeName === 'BR' && Object.keys(currentPlayer).length) {
                    players.push(currentPlayer);
                    currentPlayer = '';
                } else if (node.nodeName === 'SMALL' && node.textContent.trim() === '✓') {
                    currentPlayer.auth = true;
                } else if (node.nodeName !== 'SMALL') {
                    currentPlayer.name = node.textContent.trim();
                }
            });

            return players;
        });

    return {
        red: {
            starters: getTeamStarters(matchData, 1),
            subs: redSubs,
        },
        blue: {
            starters: getTeamStarters(matchData, 2),
            subs: blueSubs,
        }
    };
};

const getTeamStarters = (matchData, team) => (
    matchData.players.filter(player => player.team === team)
);
