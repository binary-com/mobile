/**
 * @name OAuth
 * @author Morteza Tavanarad
 * @contributors []
 * @since 03/12/2015
 * @copyright Binary Ltd
 * @description directive used to login to the app by Binary OAuth 
 */

angular
    .module('binary')
    .controller('OAuthRedirect',
            function($scope, $state){
                var response = {};
                response.url = window.location.href;

                $scope.close = function(){
                    window.opener.postMessage(response, '*');
                    window.close();
                }

                $scope.close();

            });
