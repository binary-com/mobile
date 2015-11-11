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
	.service('marketService',
		function(websocketService, proposalService, config) {

			this.getActiveMarkets = function() {
				var data = JSON.parse(sessionStorage.active_symbols);
				return Object.keys(data);
			};

			this.getAllSymbolsForAMarket = function(_market) {
				var data = JSON.parse(sessionStorage.active_symbols);
				return data[_market];
			};

			this.getSymbolDetails = function(_symbol) {
				websocketService.sendRequestFor.contractsForSymbol(_symbol);
			};

			this.getAmount = function() {
				var proposal = proposalService.get();
				return (proposal && proposal.amount) ? proposal.amount : 5;
			};

			this.getBasis = function() {
				var proposal = proposalService.get();
				return (proposal && proposal.basis) ? proposal.basis : 'payout';
			};

			this.setAmount = function(_amount) {
				var proposal = proposalService.get();
				//console.log('PROPOSAL:', proposal);
				proposal.amount = _amount;
				//console.log('prop: ', proposal);
				proposalService.update(proposal);
			};
	});
