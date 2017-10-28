/**
 * @name currency service
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 10/26/2017
 * @copyright Binary Ltd
 */

angular.module("binary").service("currencyService", function() {

    const getAccountType = (loginid) => {
        let account_type;
        if (loginid.startsWith('VR'))  account_type = 'virtual';
        else if (loginid.startsWith('MF'))  account_type = 'financial';
        else if (loginid.startsWith('MLT')) account_type = 'gaming';
        else account_type = 'real';
        return account_type;
    };

    const isAccountOfType = (type, loginid) => {
        const accountType = this.getAccountType(loginid);
        return (
            (type === 'virtual' && accountType === 'virtual') ||
            (type === 'real'    && accountType !== 'virtual') ||
            type === accountType);
    };

    this.landingCompanyValue = (loginid, key) => {
        let landingCompanyOfAccount;
        const landingCompanyObject = JSON.parse(localStorage.getItem('landingCompanyObject'));
        if (isAccountOfType('financial', loginid)) {
            landingCompanyOfAccount = landingCompanyObject.financial_company;
        } else if (isAccountOfType('real', loginid)) {
            landingCompanyOfAccount = landingCompanyObject.gaming_company;
            if (!landingCompanyOfAccount) {
                landingCompanyOfAccount = landingCompanyObject.financial_company;
            }
        } else {
            const financial_company = (landingCompanyObject.financial_company || {})[key] || [];
            const gaming_company    = (landingCompanyObject.gaming_company || {})[key] || [];
            landingCompanyOfAccount  = financial_company.concat(gaming_company);
            return landingCompanyOfAccount;
        }
        return (landingCompanyOfAccount || {})[key];
    }

    // to get legal allowed currencies and legal allowed markets
    this.getLandingCompanyProperty = (landingCompanyValue, prop) => landingCompanyValue[prop];

});
