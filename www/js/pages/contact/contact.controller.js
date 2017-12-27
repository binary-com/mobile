/**
 * @name Contact controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 04/29/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.contact.controllers").controller("ContactController", Contact);

    Contact.$inject = [];

    function Contact() {
        const vm = this;
        vm.data = {};

        vm.data.selectedCountry = "australia";
        vm.data.countries = {
            australia: {
                phone: {
                    phone_1: {
                        num: "+61 (02) 8294 5448"
                    },
                    phone_2: {
                        num      : "1800 093570",
                        toll_free: true
                    }
                }
            },
            canada: {
                phone: {
                    phone_1: {
                        num: "+1 (450) 823 1002"
                    }
                }
            },
            indonesia: {
                phone: {
                    phone_1: {
                        num      : "0018030113641",
                        toll_free: true
                    }
                }
            },
            ireland: {
                phone: {
                    phone_1: {
                        num: "+353 (0) 76 888 7500"
                    },
                    phone_2: {
                        num      : "1800931084",
                        toll_free: true
                    }
                }
            },
            poland: {
                phone: {
                    phone_1: {
                        num: "+48 58 881 00 02"
                    }
                }
            },
            russia: {
                phone: {
                    phone_1: {
                        num      : "8 10 8002 8553011",
                        toll_free: true
                    }
                }
            },
            united_kingdom: {
                phone: {
                    phone_1: {
                        num: "+44 (0) 1666 800042"
                    },
                    phone_2: {
                        num      : "0800 011 9847",
                        toll_free: true
                    }
                }
            }
        };
    }
})();
