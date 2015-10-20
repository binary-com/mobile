/**
 * @name messageService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/15/2015
 * @copyright Binary Ltd
 * Handles sending and receiving messages to ws server
 */

angular
	.module('binary')
	.service('messageService',
		function($rootScope) {
			var account = {};

			var proposal = {
				proposal: 1,
				amount: '5',
				basis: 'payout',
				contract_type: 'PUT',
				currency: 'USD',
				duration: '5',
				duration_unit: 't',
				symbol: 'R_25'
			};


			var contract = {};

			this.process = function(response) {
				var message = JSON.parse(response.data);
				if (message) {
					var messageType = message.msg_type;
					switch(messageType) {
						case 'authorize':
							if (message.authorize) {
								$rootScope.$broadcast('authorize', true);
								// save the data
								account = message.authorize;
							} else {
								$rootScope.$broadcast('authorize', false);
							}
							break;
						case 'payout_currencies':

							break;
						case 'proposal':
							if (message.proposal) {
								$rootScope.$broadcast('proposal', message.proposal);
							}
							break;
						case 'buy':
							if(message.buy) {
								$rootScope.$broadcast('buy', message.buy);
							}
							break;
						default:

							console.log('another message type: ', messageType);
					}
				}
			};

			this.getAccountInfo = function(_field) {

				return account[_field];
			};

			this.getProposal = function() {

				return proposal;
			};

			this.updateProposal = {
				amount: function(_amount) {
					proposal.amount = _amount;
				}
			};

			this.updateContract = function(_contract) {

				contract = _contract;
			};

			this.getContract = function() {

				return contract;
			};
	});
