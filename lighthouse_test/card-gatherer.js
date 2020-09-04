'use strict';

const Gatherer = require('lighthouse').Gatherer;

class TimeToCard extends Gatherer {
    afterPass(options) {
        const driver = options.driver;

        return driver.evaluateAsync('window.firstApiCallTime')
            .then(firstApiCallTime => {
                if (!firstApiCallTime) {

                    throw new Error('Unable to find first api call metrics in page');
                }
                return firstApiCallTime;
            });
    }
}

module.exports = TimeToCard;