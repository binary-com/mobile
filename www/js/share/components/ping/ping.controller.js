/**
 * @name ping controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components.ping.controllers')
    .controller('PingController', Ping);

  Ping.$inject = ['$timeout', 'websocketService']

  function Ping($timeout, websocketService){

    function init(){
      ping();
    }

    function ping(){
      websocketService.sendRequestFor.ping();

      $timeout(ping, 60000);
    }

    init();

  }
})();
