/**
 * @name payout controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/27/2016
 * @copyright Binary Ltd
 */

(function() {
	angular.module("binary.share.components.fiat-currency.controllers").controller("FiatCurrencyController", FiatCurrency);

	FiatCurrency.$inject = [];

	function FiatCurrency() {
		const vm = this;
		vm.selectedcurrency = 'lalalal';
	}
})();
