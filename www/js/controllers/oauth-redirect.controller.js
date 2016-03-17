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
            function($scope, $location, $state){
                var response = {};
                response.token = $location.search().token;
                response.expiresIn = $location.search().expires_in;

                $scope.close = function(){
                    window.opener.postMessage(response, '*');
                    window.close();
                }

                $scope.close();

            });
