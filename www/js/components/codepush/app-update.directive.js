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
                        scope.isShown = false;
                        scope.showSpinner = false;
                        scope.isDownloading = false;
                        
                        if(!scope.$$phase && !scope.$root.$$phase){
                            scope.$apply();
                        }
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
                                        scope.isShown = true;
                                        scope.showSpinner = false;
                                        scope.isDownloading = false;
                                        switch (syncStatus) {
                                            // Result (final) statuses
                                            case SyncStatus.UPDATE_INSTALLED:
                                                //alertService.displayAlert("Update","The update was installed successfully.");
                                                scope.isDownloading = false;
                                                scope.message = "update.installed";
                                                setTimeout(scope.hide, 5000);
                                                break;
                                            case SyncStatus.UP_TO_DATE:
                                                //console.log("The application is up to date.");
                                                scope.message = "update.up_to_date";
                                                setTimeout(scope.hide, 5000);
                                                break;
                                            case SyncStatus.UPDATE_IGNORED:
                                                //alertService.displayAlert("Update","The user decided not to install the optional update.");
                                                break;
                                            case SyncStatus.ERROR:
                                                //alertService.displayAlert("Update","An error occured while checking for updates");
                                                scope.isDownloading = false;
                                                scope.message = "update.error";
                                                setTimeout(scope.hide, 5000);
                                                break;

                                            // Intermediate (non final) statuses
                                            case SyncStatus.CHECKING_FOR_UPDATE:
                                                //console.log("Checking for update.");
                                                scope.message = "update.check_for_update";
                                                scope.showSpinner = true;
                                                break;
                                            case SyncStatus.AWAITING_USER_ACTION:
                                                //console.log("Alerting user.");
                                                break;
                                            case SyncStatus.DOWNLOADING_PACKAGE:
                                                //console.log("Downloading package.");
                                                scope.isDownloading = true;
                                                scope.message = "update.downloading";
                                                break;
                                            case SyncStatus.INSTALLING_UPDATE:
                                                //console.log("Installing update");
                                                scope.message = "installing";
                                                scope.showSpinner = true;
                                                break;
                                        }

                                        if(!scope.$$phase && !scope.$root.$$phase){
                                            scope.$apply();
                                        }
                                    },
                            {
                                installMode: InstallMode.IMMEDIATE, updateDialog: true
                            },
                            function (downloadProgress) {
                                //console.log("Downloading " + downloadProgress.receivedBytes + " of " + downloadProgress.totalBytes + " bytes.");
                                scope.progress = (downloadProgress.receivedBytes*100)/downloadProgress.totalBytes;
                                
                                if(!scope.$$phase && !scope.$root.$$phase){
                                    scope.$apply();
                                }
                            }
                            );
                        }
                    });
                }
            }
        });
