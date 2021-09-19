import { Client } from "discord.js";

export declare global {
    var isProd: boolean;
    var bot: Client;
    var intervals: Set;
}

export type Response = {
    data: string
};

type MatchData = {
    date: number,
    duration: number,
};
