/**
 * @name deep-link.config
 * @author Morteza Tavanarad
 * @contributors []
 * @since 10/10/2017
 * @copyright Binary Ltd
 */

angular.module('binary')
    .run(['$ionicPlatform', '$cordovaDeeplinks', '$state', '$timeout',
        ($ionicPlatform, $cordovaDeeplinks, $state, $timeout) => {
            $ionicPlatform.ready(() => {
                $cordovaDeeplinks.route({
                    '/verify/': {}
                }).subscribe((match) => {
                    console.log(match.$args);
                    if(match.$args && !_.isEmpty(match.$args.action) &&
                        match.$args.action === 'signup' && !_.isEmpty(match.$args.code)){
                        $timeout(() => {
                            $state.go('signin', {verificationCode: match.$args.code});
                        }, 100);
                    }
                }, (nomatch) => {
                });
            });
        }]);
