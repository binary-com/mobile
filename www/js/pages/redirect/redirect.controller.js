/**
 * @name Redirect Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 03/03/2018
 * @copyright Binary Ltd
 */

(function(){
    angular
        .module('binary.pages.redirect.controllers')
        .controller("RedirectController", Redirect);

    Redirect.$inject = ['$state'];

    function Redirect($state) {
        const vm = this;

        vm.init = () => {
            const url = window.location.href;
            const result = /^.*\?(.*)$/g.exec(url);

            if (result) {
                $state.go('signin', {accountTokens: url});
            } else {
                $state.go('home');
            }
        }

        vm.init();
    }

})();
