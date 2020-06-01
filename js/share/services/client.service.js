/**
 * @name client service
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 10/26/2017
 * @copyright Binary Ltd
 */

angular.module("binary").service("clientService", function(appStateService) {

    this.isLandingCompanyOf = (targetLandingCompany, accountLandingCompany) =>
        targetLandingCompany === accountLandingCompany;

    this.hasAccountOfLandingCompany = (accounts, landingCompany) => !!_.find(accounts, account =>
        this.isLandingCompanyOf(landingCompany, account.landing_company_name))

    this.getAccountType = landingCompany => {
        let account_type;
        if (landingCompany) {
            if (this.isLandingCompanyOf('virtual', landingCompany)) account_type = 'virtual';
            else if (this.isLandingCompanyOf('maltainvest', landingCompany)) account_type = 'financial';
            else if (this.isLandingCompanyOf('malta', landingCompany)) account_type = 'gaming';
            else account_type = 'real';
        }
        return account_type;
    };

    this.isAccountOfType = (type, landingCompany) => {
        const accountType = this.getAccountType(landingCompany);
        return (
            (type === 'virtual' && accountType === 'virtual') ||
            (type === 'real'    && accountType !== 'virtual') ||
            type === accountType);
    };

    this.landingCompanyValue = (landingCompany, key, landingCompanyObj) => {
        let landingCompanyOfAccount;
        const landingCompanyObject = landingCompanyObj || JSON.parse(localStorage.getItem('landingCompanyObject'));
        if (this.isAccountOfType('financial', landingCompany)) {
            landingCompanyOfAccount = landingCompanyObject.financial_company;
        } else if (this.isAccountOfType('real', landingCompany)) {
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
            if (!this.isLandingCompanyOf('virtual', account.landing_company_name) && account.currency.length > 0) {
                currencies.push(account.currency);
            }
        });
        return currencies;
    }

    this.dividedCurrencies = currencies => {
        const currencyConfig = appStateService.currenciesConfig;
        const cryptoCurrencies = [];
        const fiatCurrencies = [];
        _.forEach(currencies, currency => {
            const isCryptoCurrency = /crypto/i.test(currencyConfig[currency].type);
            if (isCryptoCurrency) {
                cryptoCurrencies.push(currency);
            } else {
                fiatCurrencies.push(currency);
            }
        });
        return {
            cryptoCurrencies,
            fiatCurrencies
        };
    };

    this.getFractionalDigits = () => {
        const currency = sessionStorage.getItem('currency') || 'USD';
        const currencyConfig = appStateService.currenciesConfig || {};
        return !_.isEmpty(currencyConfig) &&
        currencyConfig[currency] ? currencyConfig[currency].fractional_digits : 2;
    };

    this.groupMT5Accounts = accounts => {
        const groupedAccounts = {};
        const demo = [];
        const real = [];
        _.forEach(accounts, account => account.isDemo ? demo.push(account) : real.push(account));
        if (demo.length) {
            groupedAccounts.demo = demo;
        }
        if (real.length) {
            groupedAccounts.real = real;
        }
        return groupedAccounts;
    };

});
