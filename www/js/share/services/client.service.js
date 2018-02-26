/**
 * @name client service
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 10/26/2017
 * @copyright Binary Ltd
 */

angular.module("binary").service("clientService", function(appStateService) {

    this.getAccountType = (loginid) => {
        let account_type;
        if (/VR/i.test(loginid))  account_type = 'virtual';
        else if (/MF/i.test(loginid))  account_type = 'financial';
        else if (/MLT/i.test(loginid)) account_type = 'gaming';
        else account_type = 'real';
        return account_type;
    };

    this.isAccountOfType = (type, loginid) => {
        const accountType = this.getAccountType(loginid);
        return (
            (type === 'virtual' && accountType === 'virtual') ||
            (type === 'real'    && accountType !== 'virtual') ||
            type === accountType);
    };

    const isCryptocurrency = (currencyConfig, curr) => /crypto/i.test(currencyConfig[curr].type)

    this.landingCompanyValue = (loginid, key, landingCompany) => {
        let landingCompanyOfAccount;
        const landingCompanyObject = landingCompany || JSON.parse(localStorage.getItem('landingCompanyObject'));
        if (this.isAccountOfType('financial', loginid)) {
            landingCompanyOfAccount = landingCompanyObject.financial_company;
        } else if (this.isAccountOfType('real', loginid)) {
            landingCompanyOfAccount = landingCompanyObject.gaming_company;
            if (!landingCompanyOfAccount) {
                landingCompanyOfAccount = landingCompanyObject.financial_company;
            }
        } else {
            const financialCompany = (landingCompanyObject.financial_company || {})[key] || [];
            const gamingCompany    = (landingCompanyObject.gaming_company || {})[key] || [];
            landingCompanyOfAccount  = financialCompany.concat(gamingCompany);
            return landingCompanyOfAccount;
        }
        return (landingCompanyOfAccount || {})[key];
    }

    // ignore virtual account currency in existing currencies
    this.getExistingCurrencies = (accounts) => {
        const currencies = [];
        _.forIn(accounts, (account, key) => {
            if (!/VR/i.test(account.id) && account.currency.length > 0) {
                currencies.push(account.currency);
            }
        });
        return currencies;
    }

    this.dividedCurrencies = (currencies) => {
        const currencyConfig = appStateService.currenciesConfig;
        const cryptoCurrencies = [];
        const fiatCurrencies = [];
        _.forEach(currencies, curr => {
            const currency = currencyConfig[curr];
            const isCryptoCurrency = /crypto/i.test(currencyConfig[curr].type);
            if (isCryptoCurrency) {
                cryptoCurrencies.push(curr);
            } else {
                fiatCurrencies.push(curr);
            }
        });
        return {
            cryptoCurrencies,
            fiatCurrencies
        };
    }

});
