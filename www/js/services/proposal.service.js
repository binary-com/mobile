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
		function(websocketService, appStateService) {

			var createProposal = function(_data) {
				var proposal = {
					subscribe:1,
					proposal: 1,
					symbol: _data.symbol,
					contract_type: _data.contract_type,
					duration: _data.duration,
					basis: _data.basis,
					currency: _data.currency || 'USD',
					amount: (isNaN(_data.amount) || _data.amount == 0) ? 0 : _data.amount || 5,
					duration_unit: 't',
					passthrough: _data.passthrough
				};
				if(['PUT', 'CALL', 'DIGITEVEN', 'DIGITODD', 'ASIANU', 'ASIAND'].indexOf(_data.contract_type) > -1){
					delete _data.digit;
					delete _data.barrier;
				}
                else if (_data.digit >= 0) {
					proposal.barrier = _data.digit;
				}
                else if (_data.barrier >=0) {
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
                appStateService.waitForProposal = true;
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

			this.getCurrencies = function(){
				websocketService.sendRequestFor.currencies();
			}

	});
