/**
 * @contributors []
 * @since 10/25/2015
 * @copyright Binary Ltd
 */

angular.module("binary").constant("config", {
    app_id          : "10",
    serverUrl       : "frontend.binaryws.com",
    serverCertFP    : "",
    qaMachinesCertFP: "",
    wsUrl           : "wss://frontend.binaryws.com/websockets/v3", // Don't set language value here
    oauthUrl        : "https://oauth.binary.com/oauth2/authorize",
    tradeCategories : [
        {
            name   : "up_down",
            markets: ["forex", "volidx", "random"],
            value  : "UP/DOWN"
        },
        {
            name   : "digit_matches_differs",
            value  : "MATCH/DIFF",
            markets: ["volidx", "random"],
            digits : true
        },
        {
            name   : "digit_even_odd",
            markets: ["volidx", "random"],
            value  : "EVEN/ODD"
        },
        {
            name   : "digit_over_under",
            value  : "OVER/UNDER",
            markets: ["volidx", "random"],
            digits : true
        },
        {
            name   : "asians",
            value  : "Asians",
            markets: ["volidx", "random"]
        }
    ],
    tradeTypes: [
        {
            name    : "Up",
            value   : "CALL",
            digits  : false,
            category: "UP/DOWN"
        },
        {
            name    : "Down",
            value   : "PUT",
            digits  : false,
            category: "UP/DOWN"
        },
        {
            name    : "Asians Up",
            value   : "ASIANU",
            digits  : false,
            category: "Asians"
        },
        {
            name    : "Asians Down",
            value   : "ASIAND",
            digits  : false,
            category: "Asians"
        },
        {
            name    : "Digit Match",
            value   : "DIGITMATCH",
            digits  : true,
            category: "MATCH/DIFF"
        },
        {
            name    : "Digit Differs",
            value   : "DIGITDIFF",
            digits  : true,
            category: "MATCH/DIFF"
        },
        {
            name    : "Digit Even",
            value   : "DIGITEVEN",
            category: "EVEN/ODD"
        },
        {
            name    : "Digit Odd",
            value   : "DIGITODD",
            category: "EVEN/ODD"
        },
        {
            name    : "Digit Over",
            value   : "DIGITOVER",
            digits  : true,
            category: "OVER/UNDER"
        },
        {
            name    : "Digit Under",
            value   : "DIGITUNDER",
            digits  : true,
            category: "OVER/UNDER"
        }
    ],
    supportedTradeTypes: [
        "Digits Digit Matches/Digit Differs",
        "Digits Digit Odd/Digit Even",
        "Digits Digit Over/Digit Under",
        "Higher/Lower",
        "Rise/Fall",
        "Asians",
        "Up/Down"
    ],
    language    : "en",
    assetIndexes: {
        symbol             : 0,
        displayName        : 1,
        contracts          : 2,
        contractName       : 0,
        contractDisplayName: 1,
        contractFrom       : 2,
        contractTo         : 3
    },
    cryptoConfig: {
        BTC: { name: 'bitcoin' },
        BCH: { name: 'bitcoin_cash' },
        ETH: { name: 'ether' },
        ETC: { name: 'ether_classic' },
        LTC: { name: 'litecoin' },
    },
    appSupportedLanguages: ["en", "id", "ru", "zh_tw", "zh_cn", "de", "fr", "pl", "it"]
});
