angular.module("binary").controller("BodyController", function($scope, languageService) {
    const vm = this;
    vm.getLanguage = function() {
        return languageService.read();
    };
});
