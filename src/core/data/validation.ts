import {has} from "lodash";

import {err} from "../utils/logging";

module.exports = {
    validateResponseData(response: Response, url: string, expectedKeys: string[]) {
        const valid = expectedKeys.every(expectedKey => has(response?.data, expectedKey));

        if (!valid) {
            err(`Couldn't get valid data from ${url}. Response data looks like:\n${JSON.stringify(response?.data)}`);
        }

        return valid;
    },
};
