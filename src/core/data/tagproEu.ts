import axios from "axios";
import { JSDOM } from "jsdom";
import { range } from "lodash";


import { err } from "../utils/logging";
import constants from "../constants";
import { validateResponseData } from "./validation";
import { MatchData } from "../../types/custom";


export const getLatestPubId = () => new Promise<string | void>(async resolve => {
    const maxPages = 10;
    for (let page of range(maxPages)) {
        page += 1;
        let matchesResponse;
        try {
            matchesResponse = await axios.get(`${constants.eua}${constants.euaSydneyMatchesSuffix}${page}`);
        } catch (e: Error | any) {
            err('Failed to get matches page.', e);
            return resolve();
        }

        const dom = new JSDOM(matchesResponse.data);
        const tbody: HTMLTableSectionElement | null = dom.window.document.body.querySelector('tbody');

        if (!tbody) {
            err('Failed to find matches table.');
            return resolve();
        }

        const rows = [...tbody.rows];
        const firstPubRow: HTMLTableRowElement | undefined = rows.find(row => !!row.querySelector('td.matches-public'));

        const firstCellContent = firstPubRow?.cells[0].textContent;
        if (firstCellContent) resolve(firstCellContent.slice(1));
        else if (page === maxPages) {
            err(`Failed to find a public match id within ${maxPages} pages.`)
            resolve();
        }
    }
});

export const getMatchData = async (matchId: number) => {
    const matchUrl = `${constants.eua}${constants.euaMatchDataSuffix}${matchId}`;

    let matchResponse;
    try {
        matchResponse = await axios.get(matchUrl);
    } catch (e: Error | any) {
        err(`Failed to get match response for id ${matchId}.`, e);
        return;
    }

    if (!validateResponseData(matchResponse, matchUrl, ['duration', 'date', 'players'])) {
        return;
    }

    const { data } = matchResponse;

    data.id = matchId;

    return data;
};
//TODO figure out 2021-09-19T09:28:47.541561+00:00 app[worker.1]: Bot destroyed due to TypeError: getCellText(...).split is not a function.

export const getMatchTimeStampString = (matchData: MatchData) =>
    `<t:${Math.round(matchData.date + matchData.duration / 60)}:R>`;

export const getMatchDurationString = (matchData: MatchData) => {
    const hhmmssDuration = new Date(matchData.duration / 60 * 1_000).toISOString().substr(11, 8);
    return hhmmssDuration.slice(hhmmssDuration.match(/[1-9]/)?.index);
};

export const getPlayers = async (matchData: MatchData) => {
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
