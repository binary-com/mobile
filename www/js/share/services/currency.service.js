/**
 * @name currency service
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 10/26/2017
 * @copyright Binary Ltd
 */

angular.module("binary").service("currencyService", function(config) {

    const getAccountType = (loginid) => {
        let account_type;
        if (loginid.startsWith('VR'))  account_type = 'virtual';
        else if (loginid.startsWith('MF'))  account_type = 'financial';
        else if (loginid.startsWith('MLT')) account_type = 'gaming';
        else account_type = 'real';
        return account_type;
    };

    const isAccountOfType = (type, loginid) => {
        const accountType = getAccountType(loginid);
        return (
            (type === 'virtual' && accountType === 'virtual') ||
            (type === 'real'    && accountType !== 'virtual') ||
            type === accountType);
    };

    const isCryptocurrency = (currencyConfig, curr) => /crypto/i.test(currencyConfig[curr].type)

    this.landingCompanyValue = (loginid) => {
        let landingCompanyOfAccount;
        const landingCompanyObject = JSON.parse(localStorage.getItem('landingCompanyObject'));
        if (isAccountOfType('financial', loginid)) {
            landingCompanyOfAccount = landingCompanyObject.financial_company;
            console.log(landingCompanyOfAccount);
        } else if (isAccountOfType('real', loginid)) {
            landingCompanyOfAccount = landingCompanyObject.gaming_company;
            if (!landingCompanyOfAccount) {
                landingCompanyOfAccount = landingCompanyObject.financial_company;
            }
        }
        // else {
        //     const financial_company = (landingCompanyObject.financial_company || {})[key] || [];
        //     const gaming_company    = (landingCompanyObject.gaming_company || {})[key] || [];
        //     landingCompanyOfAccount  = financial_company.concat(gaming_company);
        //     return landingCompanyOfAccount;
        // }
        return landingCompanyOfAccount;
    }

    // to get legal allowed currencies and legal allowed markets
    this.getLandingCompanyProperty = (loginid, prop) => this.landingCompanyValue(loginid)[prop];

    // ignore virtual account currency in existing currencies
    this.getExistingCurrencies = (accounts) => {
        const currencies = [];
        _.forIn(accounts, (account, key) => {
            if (!account.id.startsWith('VRTC') && account.currency.length > 0) {
                currencies.push(account.currency);
            }
        });
        return currencies;
    }

    this.dividedCurrencies = (currencies) => {
		    const currencyConfig = config.currencyconfig;
		    const cryptoCurrencies = [];
		    const fiatCurrencies = [];
        _.forEach(currencies, curr => {
            const	currency = currencyConfig[curr];
            const isCryptoCurrency = isCryptoCurrency(currencyConfig, currency);
            if (isCryptoCurrency) {
                cryptoCurrencies.push(curr);
            } else {
                fiatCurrencies.push(curr);
            }
        });
        return {
            cryptoCurrencies: cryptoCurrencies,
            fiatCurrencies: fiatCurrencies
        };
    }

});
