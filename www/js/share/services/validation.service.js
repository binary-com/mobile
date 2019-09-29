/**
 * @name validation service
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 10/15/2017
 * @copyright Binary Ltd
 */

angular
    .module("binary")
    .factory(
        "validationService",
        (clientService) => {
            const validationService = {};

            const getFrctionalDigits = () => clientService.getFractionalDigits();
            const getFloatNumberRegex = () => new RegExp(`^\\d+(\\.\\d{0,${validationService.fractionalDigits}})?$`);
            const getValidateFloatNumber = (floatNumberRegex) => (val => validator(val, floatNumberRegex))()

            validationService.fractionalDigits = getFrctionalDigits();

            const validateGeneralRegex = /[`~!@#$%^&*)(_=+[}{\]\\/";:?><|]+/;
            const validateAddressRegex = /[`~!$%^&*_=+[}{\]\\"?><|]+/;
            const validatePostcodeRegex = /^([a-zA-Z\d-\s])*$/;
            const validatePhoneRegex = /^\+?((-|\s)*[0-9])*$/;
            const validateTaxIdentificationNumberRegex = /^[\w-]{0,20}$/;
            const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]+/;
            const mailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;
            const tokenRegex = /^\w{8,128}$/;
            let floatNumberRegex = getFloatNumberRegex();
            const integerRegex = /^\d+$/;
            /* eslint-disable */
            const validator = (val, regexPattern, reverse) => {
                return {
                    test(val) {
                        return reverse ? !regexPattern.test(val) : regexPattern.test(val);
                    }
                }
            };
            /* eslint-enable */


            validationService.validateGeneral = (val => validator(val, validateGeneralRegex, true))();
            validationService.validateAddress = (val => validator(val, validateAddressRegex, true))();
            validationService.validatePostcode = (val => validator(val, validatePostcodeRegex))();
            validationService.validatePhone = (val => validator(val, validatePhoneRegex))();
            validationService.validateTaxIdentificationNumber = (val =>
                validator(val, validateTaxIdentificationNumberRegex))();
            validationService.validatePassword = (val => validator(val, passwordRegex))();
            validationService.validateMail = (val => validator(val, mailRegex))();
            validationService.validateToken = (val => validator(val, tokenRegex))();

            validationService.validateFloatNumber = getValidateFloatNumber(floatNumberRegex);
            validationService.validateIntegerNumber = (val => validator(val, integerRegex))();

            validationService.length = {
                name: {
                    min: 2,
                    max: 50,
                },
                tin: {
                    max: 20,
                },
                address: {
                    max: 70,
                },
                city: {
                    max: 35,
                },
                postcode: {
                    max: 20,
                },
                phone: {
                    min: 8,
                    max: 35
                },
                secret_answer: {
                    min: 4,
                    max: 50
                },
                password: {
                    min: 6,
                    max: 25
                },
                selfExclusionLimits: {
                    max: 20
                },
                selfExclusionOpenPositions: {
                    max: 4
                },
                selfExclusionSessionDuration: {
                    max: 5
                }
            };

            validationService.reset = () => {
                validationService.fractionalDigits = getFrctionalDigits();
                floatNumberRegex = getFloatNumberRegex();
                validationService.validateFloatNumber = getValidateFloatNumber(floatNumberRegex);
            }

            return validationService;
        }
    );
