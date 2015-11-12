/**
 * @name proposalService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/15/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.service('proposalService',
		function(websocketService) {

			var createProposal = function(_data) {
				//console.log('data1: ', _data);
				var proposal = {
					proposal: 1,
					symbol: _data.symbol,
					contract_type: _data.tradeType || _data.contract_type,
					duration: _data.tick,
					basis: _data.basis,
					currency: _data.currency || 'USD',
					amount: _data.amount || 5,
					duration_unit: 't'
				};
				if (_data.digit >= 0) {
					proposal.barrier = _data.digit;
				}
				if (_data.barrier >=0) {
					proposal.barrier = _data.barrier;
				}

				//console.log('data2: ', proposal);
				return proposal;
			};

			this.update = function(_proposal) {
				if (_proposal) {
					localStorage.proposal = JSON.stringify(createProposal(_proposal));
				}
			};

			this.send = function() {
				websocketService.sendRequestFor.forgetProposals();

				websocketService.sendRequestFor.proposal(JSON.parse(localStorage.proposal));
			};

			this.get = function() {
				if (localStorage.proposal) {
					return JSON.parse(localStorage.proposal);
				}
				return false;
			};


	});
