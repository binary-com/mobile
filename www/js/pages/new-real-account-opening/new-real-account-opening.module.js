/**
 * @name Singin Module
 * @author Morteza Tavanarad
 * @contributors []
 * @since 8/10/2016
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
