const { has } = require('lodash');

const { err } = require('../utils/logging');

module.exports = {
    validateResponseData: (response, url, expectedKeys) => {
        const valid = expectedKeys.every(expectedKey => has(response?.data, expectedKey));

        if (!valid) {
            err(`Couldn't get valid data from ${url}. Response data looks like:\n${JSON.stringify(response?.data)}`);
        }

        return valid;
    },
};
