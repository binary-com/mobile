/**
 * @name trayeTypes service
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/24/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.services").factory("tradeTypesService", TradeTypes);

    function TradeTypes(config) {
        const directive = {};
        const supportedTradeTypes = config.supportedTradeTypes;

        directive.findTickContracts = function(contracts) {
            const tradeTypes = {};
            _.forEach(contracts, (value, key) => {
                const contracts = [];

                value.forEach((v, i) => {
                    if (value[i].expiry_type === "tick") {
                        contracts.push(value[i]);
                    }
                });

                if (contracts.length > 0) {
                    tradeTypes[key] = contracts;
                }
            });

            const groupedTradeTypes = {};
            _.forEach(tradeTypes, (value, key) => {
                if (value.length === 2) {
                    groupedTradeTypes[value[0].contract_category_display] = value;
                } else {
                    for (let i = 0; i < value.length; i += 2) {
                        let name = value[i].contract_category_display;
                        if (value[i].contract_category === "callput") {
                            if (_.isEmpty(value[i].barrier)) {
                                name = "Rise/Fall";
                            } else {
                                name = "Higher/Lower";
                            }
                        } else {
                            name += ` ${value[i].contract_display.capitalize()}/${value[
                                i + 1
                            ].contract_display.capitalize()}`;
                        }

                        groupedTradeTypes[name] = [value[i], value[i + 1]];
                    }
                }
            });

            const supportedGroupedTradeTypes = {};
            _.forIn(groupedTradeTypes, (value, key) => {
                if (_.includes(supportedTradeTypes, key)) {
                    supportedGroupedTradeTypes[key] = value;
                }
            });
            sessionStorage.tradeTypes = JSON.stringify(supportedGroupedTradeTypes);
            return supportedGroupedTradeTypes;
        };

        return directive;
    }
})();
