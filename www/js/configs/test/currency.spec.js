describe('custom currency filter', function() {

    var $filter;
    var currency;

    beforeEach(function() {
        module('binary');
    });

    beforeEach(angular.mock.inject(function(_$filter_) {
        $filter = _$filter_;
        currency = $filter('currency');
    }));

    it ('returns -- when given a non-numerical', function() {
        expect(currency(undefined)).toEqual('--');
    });

    it ('returns empty string when given a null currency', function() {
        expect(currency(1232)).toEqual('');
    });

    it ('sets 2 decimal points for fiants', function() {
        expect(/\d+\.\d{2}/.test(currency(1232.2131, 'USD'))).toBeTruthy();
    });

    it ('set 8 decimal points for crypto currensies', function() {
        expect(/\d+\.\d{8}/.test(currency(0.0005, 'BTC'))).toBeTruthy();
    });
});
