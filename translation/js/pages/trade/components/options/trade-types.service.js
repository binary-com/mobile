/**
 * @name trayeTypes service
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/24/2016
 * @copyright Binary Ltd
 */

(function(){
    'use strict';

    angular
        .module('binary.pages.trade.components.options.services')
        .factory('tradeTypesService', TradeTypes);

    function TradeTypes(){
        var directive = {};

        directive.findTickContracts = function(contracts){
            var tradeTypes = {};
            _.forEach(contracts, (value, key) => {
                var contracts = [];

                for(var i in value){
                    if(value[i].expiry_type === 'tick'){
                        contracts.push(value[i]);
                    }
                }

                if(contracts.length > 0){
                    tradeTypes[key] = contracts;
                }
            });


            var groupedTradeTypes = {};
            _.forEach(tradeTypes, (value, key) => {
                if(value.length == 2){
                    groupedTradeTypes[value[0].contract_category_display] = value;
                } else {
                    for(var i=0; i < value.length; i = i+2){
                        var name = value[i].contract_category_display;
                        if(value[i].contract_category === 'callput'){
                            if(_.isEmpty(value[i].barrier)){
                                name = "Rise/Fall";
                            } else {
                                name = "Higher/Lower";
                            }
                        } else {
                        name += " " + 
                            value[i].contract_display.capitalize() + "/" +
                            value[i+1].contract_display.capitalize();
                        }

                        groupedTradeTypes[name] = [value[i], value[i+1]];
                    }
                }
            });

            sessionStorage.tradeTypes = JSON.stringify(groupedTradeTypes);
            return groupedTradeTypes;
        }

        return directive;
    }
})();
