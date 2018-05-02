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
                    '/redirect': {},
                }).subscribe((match) => {
                    if(match.$args && !_.isEmpty(match.$args.action)) {
                        if (match.$args.action === 'signup' && !_.isEmpty(match.$args.code)){
                            $timeout(() => {
                                $state.go('signin', {verificationCode: match.$args.code});
                            }, 100);
                        } else if (match.$args.action === 'oauth') {
                            const tokens = /action=oauth&(.*)/.exec(match.$link.queryString);
 
                            if (_.isEmpty(tokens)) {
                                return;
                            }

                            $timeout(() => {
                                $state.go('signin', {accountTokens: tokens[1]});
                            }, 100);
                        }
                    }
                }, (nomatch) => {
                });
            });
        }]);
