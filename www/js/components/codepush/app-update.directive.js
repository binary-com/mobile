/**
 * @name appUpdate
 * @author Morteza Tavanarad
 * @contributors []
 * @since 02/07/2016
 * @copyright Binary Ltd
 */

 angular
 	.module('binary')
 	.directive('appUpdate',
 		function($ionicPlatform){
 			return{
 				scope: {},
 				restrict: 'E',
 				templateUrl: "templates/components/codepush/app-update.template.html",
 				link: function(scope, element, attrs, ngModel){
                    scope.hide = function(){
                        scope.$applyAsync(function(){
                            scope.isShown = false;
                            scope.showSpinner = false;
                            scope.isDownloading = false;
                        });
                    }

                    // Use codepush to check new update and install it.
                    $ionicPlatform.ready(function(){
                        scope.isShown = false;
                        scope.showSpinner = false;
                        scope.isDownloading = true;
                        scope.progress = 0;
                        if(window.codePush){
                            codePush.sync(
                                    function (syncStatus) {
                                        scope.$applyAsync(function(){
                                            scope.isShown = false;
                                            scope.showSpinner = false;
                                            scope.isDownloading = false;
                                            switch (syncStatus) {
                                                // Result (final) statuses
                                                case SyncStatus.UPDATE_INSTALLED:
                                                    scope.isShown = true;
                                                    scope.isDownloading = false;
                                                    scope.message = "update.installed";
                                                    setTimeout(scope.hide, 5000);
                                                    break;
                                                case SyncStatus.UP_TO_DATE:
                                                    scope.message = "update.up_to_date";
                                                    setTimeout(scope.hide, 5000);
                                                    break;
                                                case SyncStatus.UPDATE_IGNORED:
                                                    break;
                                                case SyncStatus.ERROR:
                                                    scope.isDownloading = false;
                                                    scope.message = "update.error";
                                                    setTimeout(scope.hide, 5000);
                                                    break;

                                                // Intermediate (non final) statuses
                                                case SyncStatus.CHECKING_FOR_UPDATE:
                                                    scope.message = "update.check_for_update";
                                                    scope.showSpinner = true;
                                                    break;
                                                case SyncStatus.AWAITING_USER_ACTION:
                                                    break;
                                                case SyncStatus.DOWNLOADING_PACKAGE:
                                                    scope.isShown = true;
                                                    scope.isDownloading = true;
                                                    scope.message = "update.downloading";
                                                    break;
                                                case SyncStatus.INSTALLING_UPDATE:
                                                    scope.isShown = true;
                                                    scope.message = "installing";
                                                    scope.showSpinner = true;
                                                    setTimeout(scope.hide, 5000);
                                                    break;
                                            }
                                        });

                                    },
                            {
                                installMode: InstallMode.IMMEDIATE, updateDialog: true
                            },
                            function (downloadProgress) {
                                scope.$applyAsync(function(){
                                    scope.isShown = true;
                                    scope.isDownloading = true;
                                    scope.progress = (downloadProgress.receivedBytes*100)/downloadProgress.totalBytes;
                                });
                            }
                            );
                        }
                    });
                }
            }
        });
