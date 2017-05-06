angular
  .module('binary')
  .controller('MainLayoutController',
    function($scope, $ionicSideMenuDelegate, accountService, websocketService){
      var vm = this;
      vm.hasMTAccess = false;

      vm.linkToRegulatory = "https://www.binary.com/" + (localStorage.getItem('language') || "en") + "/regulation.html";
      vm.goToRegulatory = function() {
        window.open(vm.linkToRegulatory, '_blank');
      }

      $scope.$on('landing_company', (e, landingCompany)=>{
        $scope.$applyAsync(()=>{
        if(landingCompany.hasOwnProperty('mt_financial_company')
      && landingCompany.mt_financial_company.shortcode == 'vanuatu'){
        vm.hasMTAccess = true;
      }
    });
    });

      vm.updateDefaultAccount = function() {
        localStorage.defaultAccount = accountService.getDefault().id;
        vm.selectedAccount = accountService.getDefault().id;
      }
      vm.updateDefaultAccount();


      $scope.$watch(function () {
          return $ionicSideMenuDelegate.isOpenLeft();
        },
        function (isOpen) {
          if (!isOpen){
            vm.showAccountSwitch = false;
          }
        });


      function init() {
        var account = accountService.getDefault();
        if (account){
          websocketService.sendRequestFor.landingCompanySend(account.country);
        }
      }
    });