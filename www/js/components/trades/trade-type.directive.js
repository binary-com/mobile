/**
 * @name tradeType
 * @author Morteza Tavanarad
 * @contributors []
 * @since 02/12/2016
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('tradeType',
            function(config, proposalService){
                return {
                    restrict: "E",
                    templateUrl: "templates/components/trades/trade-type.template.html",
                    scope:{
                        proposal: "="
                    },
                    link: function(scope, element){
                        function init(){
                            
                            scope.tradeCategory = _.find(config.tradeTypes, ['value', scope.proposal.contract_type]).category;
                            scope.tradeTypes = _.filter(config.tradeTypes, ['category', scope.tradeCategory]);

                        }

                        function updateProposal(_tradeType){
                            scope.proposal = proposalService.get();
                            if(scope.proposal){
                                scope.proposal.contract_type = _tradeType;
                                proposalService.update(scope.proposal);
                                proposalService.send(scope.proposal && scope.proposal.id ? scope.proposal.id : null);
                            }
                        }

                        scope.changeTradeType = function(){
                            updateProposal(scope.proposal.contract_type);
                        };

                        scope.checkDigitsConditions = function(_tradeType){
                            if(_tradeType === 'DIGITOVER' && scope.proposal.barrier == 9){
                                return true;
                            }
                            else if(_tradeType === 'DIGITUNDER' && scope.proposal.barrier == 0){
                                return true;
                            }
                            return false;
                        };

                        init();
                    }
                };
            });
