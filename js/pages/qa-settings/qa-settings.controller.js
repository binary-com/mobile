/**
 * @name qa-settings controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 10/14/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function(){


    angular
        .module('binary.pages.qa-settings.controllers')
        .controller('QASettingsController', QASettings);

    QASettings.$inject = ['$state', 'appStateService',
        'config', 'websocketService'];

    function QASettings($state, appStateService,
        config, websocketService){
        const vm = this;

        vm.saveSettings = function(){
            const settings = {};
            config.wsUrl = vm.wsUrl;
            settings.server_url = new URL(vm.wsUrl).hostname;
            config.app_id = vm.appId.toString();
            settings.appId = vm.appId.toString();
            config.oauthUrl = vm.oauthUrl;
            settings.oauthUrl = vm.oauthUrl;

            Object.keys(settings).forEach((key) => localStorage.setItem(`config.${key}`, settings[key]));

            delete settings.server_url;
            settings.wsUrl = vm.wsUrl;
            localStorage.qaSettings = JSON.stringify(settings);

            websocketService.closeConnection();
            $state.go('home');
        }

        function init(){
            let settings = {};
            if(!_.isEmpty(localStorage.qaSettings)){
                settings = JSON.parse(localStorage.qaSettings);
            }

            vm.wsUrl = settings.wsUrl || config.wsUrl;
            vm.oauthUrl = settings.oauthUrl || config.oauthUrl;
            vm.appId = Number(settings.appId) || Number(config.app_id);
        }

        init();
    }
})();

