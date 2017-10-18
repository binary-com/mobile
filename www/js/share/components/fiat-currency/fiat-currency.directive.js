/**
 * @name FIAT currency directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 10/18/2017
 * @copyright Binary Ltd
 */

(function() {
	angular.module("binary.share.components.fiat-currency.directives").directive("bgFiatCurrency", FiatCurrency);

	function FiatCurrency() {
		const directive = {
			restrict        : "E",
			templateUrl     : "js/share/components/fiat-currency/fiat-currency.template.html",
			controller      : "FiatCurrencyController",
			controllerAs    : "vm",
			bindToController: true,
			scope           : {
				selectedcurrency: "="
			}
		};

		return directive;
	}
})();
