/**
 * @name proposal service
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/27/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.services").factory("proposalService", Proposal);

    Proposal.$inject = ["$rootScope", "websocketService"];

    function Proposal($rootScope, websocketService) {
        const factory = {};

        factory.get = function() {
            if (_.isEmpty(localStorage.options)) {
                return create();
            }
            const options = JSON.parse(localStorage.options);
            const proposal = create();
            proposal.symbol = options.underlying.symbol;
            proposal.duration = options.tick;
            if (options.tradeType === "Higher/Lower") {
                proposal.barrier = _.isEmpty(options.barrier) ? "" : options.barrier;
            } else {
                proposal.barrier = options.digit;
            }
            proposal.tradeType = options.tradeType;
            proposal.amount = options.amount || proposal.amount;
            proposal.basis = options.basis || proposal.basis;
            proposal.currency = sessionStorage.currency || "USD";
            return proposal;
        };

        factory.save = function(options) {
            localStorage.options = JSON.stringify(options);
        };

        factory.setPropertyValue = function(propertyName, value) {
            const options = JSON.parse(localStorage.options);
            options[propertyName] = value;
            localStorage.options = JSON.stringify(options);
            $rootScope.$broadcast("options:updated", options);
        };

        factory.update = function(options) {
            const proposal = factory.get();

            proposal.symbol = options.underlying.symbol;
            proposal.duration = options.tick;
            if (options.tradeType === "Higher/Lower") {
                proposal.barrier = _.isEmpty(options.barrier) ? "" : options.barrier;
            } else {
                proposal.barrier = options.digit;
            }
            proposal.tradeType = options.tradeType;
            proposal.amount = options.amount || proposal.amount;
            proposal.basis = options.basis || proposal.basis;

            factory.save(options);
            return proposal;
        };

        factory.send = function(proposal) {
            delete proposal.tradeType;
            if (validate(proposal)) {
                websocketService.sendRequestFor.proposal(proposal);
                return true;
            }
            return false;
        };

        factory.forget = function(reqId) {
            websocketService.sendRequestFor.forgetProposals(reqId);
        };

        factory.purchase = function(contract) {
            websocketService.sendRequestFor.purchase(contract.id, contract.ask_price);
            factory.forget();
        };

        function create() {
            const proposal = {
                subscribe    : 1,
                proposal     : 1,
                symbol       : null,
                contract_type: null,
                duration     : null,
                basis        : "payout",
                currency     : sessionStorage.currency || "USD",
                amount       : 5,
                duration_unit: "t",
                passthrough  : null
            };

            return proposal;
        }

        function validate(proposal) {
            let isValidate = true;
            _.forEach(proposal, (value, key) => {
                if (value == null || value === "") {
                    delete proposal[key];
                }
            });

            _.forEach(proposalSchema, (value, key) => {
                if (proposal[key]) {
                    if (!value.format.pattern.test(proposal[key])) {
                        isValidate = false;
                    }
                } else if (proposal[key] === undefined && value.persence) {
                    isValidate = false;
                }
            });
            return isValidate;
        }

        var proposalSchema = {
            amount: {
                presence: true,
                format  : {
                    pattern: /^(\d+\.?\d{0,2}|\.\d{1,2})$/
                }
            },
            basis: {
                persence: true,
                format  : {
                    pattern: /^payout|stake$/
                }
            },
            contract_type: {
                persence: true,
                format  : {
                    pattern: /^\w{2,30}$/
                }
            },
            currency: {
                persence: true,
                format  : {
                    pattern: /^[A-Z]{3}$/
                }
            },
            duration: {
                persence: true,
                format  : {
                    pattern: /^\d+$/
                }
            },
            duration_unit: {
                persence: true,
                format  : {
                    pattern: /^d|m|s|h|t$/
                }
            },
            symbol: {
                persence: true,
                format  : {
                    pattern: /^\w{2,30}$/
                }
            },
            barrier: {
                persence: false,
                format  : {
                    pattern: /^[+-]?\d+\.?\d*$/
                }
            }
        };

        return factory;
    }
})();
