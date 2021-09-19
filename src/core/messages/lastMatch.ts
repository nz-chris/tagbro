import pluralize from "pluralize";

import constants from "../constants";
import {
    getLatestPubId,
    getMatchData,
    getMatchDurationString,
    getMatchTimeStampString,
    getPlayers
} from "../data/tagproEu";

export const getMessage = async () => {
    const matchId = await getLatestPubId();
    if (!matchId) return;

    const matchData = await getMatchData(matchId);
    if (!matchData) return;

    const players = await getPlayers(matchData);
    const numPlayers = players.red.starters.length + players.red.subs.length +
        players.blue.starters.length + players.blue.subs.length

    return `${constants.lastMatchMessagePrefix} ${getMatchTimeStampString(matchData)} on ${matchData.map.name}. ` +
        `It featured ${pluralize('players', numPlayers, true)} ` +
        `and the duration was ${getMatchDurationString(matchData)}.`;
};
