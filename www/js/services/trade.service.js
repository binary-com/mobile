/**
 * @name tradeService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/15/2015
 * @copyright Binary Ltd
 * Handles websocket functionalities
 */

angular
	.module('binary')
	.service('tradeService',
		function(websocketService, config) {

			// TODO: rename it
			this.updateProposal = function(_proposal) {
				if (_proposal) {
					localStorage['proposal'] = JSON.stringify(_proposal);
				}
			};

			// TODO: rename it
			this.sendProposal = function() {
				websocketService.sendRequestFor.forgetProposals();
				if (!localStorage.proposal) {
					localStorage.proposal = JSON.stringify(config.default.proposal);
				}

				websocketService.sendRequestFor.proposal(JSON.parse(localStorage.proposal));
			};

			this.getProposal = function() {
				if (localStorage['proposal']) {
					return JSON.parse(localStorage['proposal']);
				}
				return false;
			};

			this.getMarketForASymbol = function(_symbol) {
				var data = JSON.parse(sessionStorage['active_symbols']);

				var x = data.find(function(el, i, arr) {
					if(el.symbol === _symbol) {
						return el.market;
					}
				});

				return x ? x : false;
			};

			this.getAllSymbolsForAMarket = function(_market) {
				var data = JSON.parse(sessionStorage['active_symbols']);
				var symbols = [];
				data.forEach(function(el, i, arr) {
					if (el.market === _market) {
						symbols.push({
							symbol: el.symbol,
							name: el.display_name
						});
					}
				});
				return symbols;
			};

			this.getAllCurrencies = function() {
				return JSON.parse(sessionStorage['currencies']);
			};

			this.getAmount = function() {
				var proposal = this.getProposal();
				return (proposal && proposal.amount) ? proposal.amount : 5;
			};

			this.setAmount = function(_amount) {
				var proposal = this.getProposal();
				proposal.amount = _amount;
				this.updateProposal(proposal);
			};

			this.getBasis = function() {
				var proposal = this.getProposal();
				return (proposal && proposal.basis) ? proposal.basis : 'payout';
			};
	});
