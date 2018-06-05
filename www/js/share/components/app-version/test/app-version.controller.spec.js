describe('app-version controller', () => {

    var $ionicPlatform;
    var $controller;
    var $rootScope;
    var $scope;
    var AppVersion;

    beforeEach(module('binary'));

    beforeEach(inject((_$controller_, _$rootScope_, _$ionicPlatform_) => {
        $ionicPlatform = _$ionicPlatform_;
        $controller = _$controller_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(() => {
        $scope = $rootScope.$new();
        spyOn($ionicPlatform, 'ready').and.callThrough();
        AppVersion = $controller('AppVersionController', {
            $scope: $scope,
            $ionicPlatform: $ionicPlatform,
        });
    });

    it ('should be defined', () => {

        expect(AppVersion).toBeDefined();
    });

    it ('vm.appVersion should be like x.y.z', () => {
        console.log(JSON.stringify(AppVersion));
        expect($ionicPlatform.ready).toHaveBeenCalled();

        expect(/\d+\.\d+\.\d+/.test(AppVersion.appVersion,)).toBeTruthy();
    });
});
