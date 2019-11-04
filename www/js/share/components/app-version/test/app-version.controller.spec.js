describe('app-version controller', () => {

    let $ionicPlatform;
    let $controller;
    let $rootScope;
    let $scope;
    let AppVersion;

    beforeEach(module('binary'));

    beforeEach(angular.mock.inject((_$controller_, _$rootScope_, _$ionicPlatform_) => {
        $ionicPlatform = _$ionicPlatform_;
        $controller = _$controller_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(() => {
        $scope = $rootScope.$new();
        spyOn($ionicPlatform, 'ready').and.callThrough();
        AppVersion = $controller('AppVersionController', {
            $scope,
            $ionicPlatform,
        });
    });

    it ('should be defined', () => {

        expect(AppVersion).toBeDefined();
    });

    it ('vm.appVersion should be like x.y.z', () => {
        expect($ionicPlatform.ready).toHaveBeenCalled();

        expect(/\d+\.\d+\.\d+/.test(AppVersion.appVersion,)).toBeTruthy();
    });
});
