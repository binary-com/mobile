describe('custom currency filter', () => {

    let $filter;
    let currency;

    beforeEach(() => {
        module('binary');
    });

    beforeEach(angular.mock.inject((_$filter_) => {
        $filter = _$filter_;
        currency = $filter('currency');
    }));

    it ('returns -- when given a non-numerical', () => {
        expect(currency(undefined)).toEqual('--');
    });

    it ('returns empty string when given a null currency', () => {
        expect(currency(1232)).toEqual('');
    });

    it ('sets 2 decimal points for fiants', () => {
        expect(/\d+\.\d{2}/.test(currency(1232.2131, 'USD'))).toBeTruthy();
    });

    it ('set 8 decimal points for crypto currensies', () => {
        expect(/\d+\.\d{8}/.test(currency(0.0005, 'BTC'))).toBeTruthy();
    });
});
