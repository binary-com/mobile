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
				var proposal = {
					proposal: 1,
					symbol: _data.symbol,
					contract_type: _data.contract_type,
					duration: _data.duration,
					basis: _data.basis,
					currency: _data.currency || 'USD',
					amount: _data.amount || 5,
					duration_unit: 't',
					passthrough: _data.passthrough
				};
				if(_data.contract_type === "PUT" || _data.contract_type === "CALL"){
					delete _data.digit;
					delete _data.barrier;
				}
				if (_data.digit && _data.digit >= 0) {
					proposal.barrier = _data.digit;
				}
				if (_data.barrier >=0) {
					proposal.barrier = _data.barrier;
				}

				return proposal;
			};

			this.update = function(_proposal) {
				if (_proposal) {
					localStorage.proposal = JSON.stringify(createProposal(_proposal));
				}
			};

			this.send = function(_oldId) {
				websocketService.sendRequestFor.forgetProposals();
				websocketService.sendRequestFor.proposal(JSON.parse(localStorage.proposal));
			};

			this.get = function() {
				if (localStorage.proposal) {
					return JSON.parse(localStorage.proposal);
				}
				return false;
			};

			this.remove = function(){
				localStorage.removeItem('proposal');
			}


	});
