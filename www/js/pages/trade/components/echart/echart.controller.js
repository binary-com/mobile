/**
 * @name echart controller
 * @author morteza tavnarad
 * @contributors []
 * @since 06/04/2017
 * @copyright binary ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.trade.components.echart.controllers')
    .controller('ChartController', Chart);

  Chart.$inject = ['$scope', 'chartService', 'websocketService'];

  function Chart($scope, chartService, websocketService){
    var vm = this;

    $scope.$on('$destroy', (e, value) => {
      websocketService.sendRequestFor.forgetTicks();
      chartService.destroy();
    });

    $scope.$on('tick', (e, feed) => {
      if (feed && feed.echo_req.ticks_history === vm.proposal.symbol) {
        chartService.addTick(feed.tick);
      } else {
        websocketService.sendRequestFor.forgetStream(feed.tick.id);
      }
    });

    $scope.$on('history', (e, feed) => {
      if (feed && feed.echo_req.ticks_history === vm.proposal.symbol) {
        chartService.addHistory(feed.history);
      }
    });

    $scope.$watch(()=>{ return vm.proposal.symbol },
        (newValue, oldValue) =>{
          if(vm.proposal.symbol){ //&& newValue !== oldValue){
            sendTickHistoryRequest();
          }
      });


    init();


    function init(){
      var chartDOM = document.getElementById('tradeChart');
      chartService.init(chartDOM);

      sendTickHistoryRequest();

    }

    function sendTickHistoryRequest(){
      if(_.isEmpty(vm.proposal.symbol)){
        return;
      }

      var symbol = vm.proposal.symbol;
      websocketService.sendRequestFor.forgetTicks();
      websocketService.sendRequestFor.ticksHistory({
        ticks_history: symbol,
        end: 'latest',
        count: 600, //chartService.getCapacity(),
        subscribe: 1
      });
    }



  }
})();
