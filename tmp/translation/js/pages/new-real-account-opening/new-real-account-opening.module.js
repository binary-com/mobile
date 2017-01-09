/**
 * @name new-real-account-opening module
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.new-real-account-opening', [
      'binary.pages.new-real-account-opening.controllers',
      'binary.pages.new-real-account-opening.components'
			    ]);

  angular
    .module('binary.pages.new-real-account-opening.controllers', []);

  angular
    .module('binary.pages.new-real-account-opening.components', [
        'binary.pages.new-real-account-opening.components.new-account-maltainvest',
				'binary.pages.new-real-account-opening.components.new-account-real'

    ]);
})();
