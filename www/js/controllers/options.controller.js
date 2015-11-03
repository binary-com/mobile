/**
 * @name OptionsController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles changing contract's options
 */

angular
	.module('binary')
	.controller('OptionsController',
		function($scope, $rootScope, $state, config, websocketService, tokenService, tradeService) {

			$rootScope.$on('refresh:options', function(e, response) {
				init();
			});

			var init = function() {
				// ACCOUNTS
				$scope.accounts = tokenService.getAllTokens();
				$scope.selectedAccount = tokenService.getDefaultToken();

				// MARKET & UNDERLYINGS
				$scope.selectedSymbol = tradeService.getProposal().symbol;
				$scope.market = tradeService.getMarketForASymbol($scope.selectedSymbol).market;
				$scope.symbols = tradeService.getAllSymbolsForAMarket($scope.market);

				// TRADE TYPE & TICK & BASIS
				$scope.tradeType = tradeService.getProposal().contract_type;
				$scope.ticks = tradeService.getProposal().duration;
				$scope.basis = tradeService.getProposal().basis;

				// CURRENCY
				websocketService.sendRequestFor.currencies();
				$scope.currencies = tradeService.getAllCurrencies();
				$scope.selectedCurrency = tradeService.getProposal().currency;

				console.log('market: ', $scope.market);
			};

			init();

			$scope.updateAccount = function(_account) {
				$scope.selectedAccount = _account;
				// reauthorize()
			};

			$scope.updateMarket = function(_market) {
				$scope.market = _market;
				$scope.symbols = tradeService.getAllSymbolsForAMarket($scope.market);
				$scope.selectedSymbol = $scope.symbols[0].symbol;
				$scope.tradeType = 'CALL';
			};

			$scope.updateSymbol = function(_selectedSymbol) {
				$scope.selectedSymbol = _selectedSymbol;
			};

			$scope.updateTradeType = function(_tradeType) {
				$scope.tradeType = _tradeType;
			};

			$scope.updateTicks = function(_tick) {
				$scope.ticks = _tick;
			};

			$scope.updateBasis = function(_basis) {
				$scope.basis = _basis;
			};

			$scope.updateCurrency = function(_currency) {
				$scope.selectedCurrency = _currency;
			};

			// Navigations

			$scope.navigateToManageAccounts = function() {
				$state.go('accounts');
			};

			$scope.navigateToTradePage = function() {
				$state.go('trade');
			};

			$scope.saveChanges = function() {
				var proposal = {
					proposal: 1,
					symbol: $scope.selectedSymbol,
					contract_type: $scope.tradeType,
					duration: $scope.ticks,
					basis: $scope.basis,
					currency: $scope.selectedCurrency,
					amount: tradeService.getAmount(),
					duration_unit: 't'
				};
				tradeService.updateProposal(proposal);
				tradeService.sendProposal();

				$state.go('trade', {}, { reload: true, inherit: false, notify: true });
			};
	});

























