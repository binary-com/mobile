/**
 * @contributors []
 * @since 10/25/2015
 * @copyright Binary Ltd
 */

const isBinaryMe = window.location.host === 'ticktrade.binary.me';

angular.module("binary").constant("config", {
    app_id          : isBinaryMe ? "15488" : "10",
    serverUrl       : "frontend.binaryws.com",
    serverCertFP    : "",
    qaMachinesCertFP: "",
    wsUrl           : "wss://frontend.binaryws.com/websockets/v3", // Don't set language value here
    oauthUrl        : `https://oauth.binary.${isBinaryMe ? 'me' : 'com'}/oauth2/authorize`,
    tradeCategories : [
        {
            name   : "up_down",
            markets: ["forex", "synthetic_index", "random"],
            value  : "UP/DOWN"
        },
        {
            name   : "digit_matches_differs",
            value  : "MATCH/DIFF",
            markets: ["synthetic_index", "random"],
            digits : true
        },
        {
            name   : "digit_even_odd",
            markets: ["synthetic_index", "random"],
            value  : "EVEN/ODD"
        },
        {
            name   : "digit_over_under",
            value  : "OVER/UNDER",
            markets: ["synthetic_index", "random"],
            digits : true
        },
        {
            name   : "asians",
            value  : "Asians",
            markets: ["synthetic_index", "random"]
        },
        {
            name   : "high_low_ticks",
            value  : "HIGH/LOW TICKS",
            markets: ["synthetic_index"]
        }
    ],
    tradeTypes: [
        {
            name         : "Up",
            value        : "CALL",
            digits       : false,
            selected_tick: false,
            category     : "UP/DOWN"
        },
        {
            name         : "Down",
            value        : "PUT",
            digits       : false,
            selected_tick: false,
            category     : "UP/DOWN"
        },
        {
            name         : "Asians Up",
            value        : "ASIANU",
            digits       : false,
            selected_tick: false,
            category     : "Asians"
        },
        {
            name         : "Asians Down",
            value        : "ASIAND",
            digits       : false,
            selected_tick: false,
            category     : "Asians"
        },
        {
            name         : "Digit Match",
            value        : "DIGITMATCH",
            digits       : true,
            selected_tick: false,
            category     : "MATCH/DIFF"
        },
        {
            name         : "Digit Differs",
            value        : "DIGITDIFF",
            digits       : true,
            selected_tick: false,
            category     : "MATCH/DIFF"
        },
        {
            name         : "Digit Even",
            value        : "DIGITEVEN",
            digits       : true,
            selected_tick: false,
            category     : "EVEN/ODD"
        },
        {
            name         : "Digit Odd",
            value        : "DIGITODD",
            digits       : true,
            selected_tick: false,
            category     : "EVEN/ODD"
        },
        {
            name         : "Digit Over",
            value        : "DIGITOVER",
            digits       : true,
            selected_tick: false,
            category     : "OVER/UNDER"
        },
        {
            name         : "Digit Under",
            value        : "DIGITUNDER",
            digits       : true,
            selected_tick: false,
            category     : "OVER/UNDER"
        },
        {
            name         : "TICK HIGH",
            value        : "TICKHIGH",
            digits       : false,
            selected_tick: true,
            category     : "HIGH/LOW TICKS"
        },
        {
            name         : "TICK LOW",
            value        : "TICKLOW",
            digits       : false,
            selected_tick: true,
            category     : "HIGH/LOW TICKS"
        }
    ],
    supportedTradeTypes: [
        "Digits Digit Matches/Digit Differs",
        "Digits Digit Odd/Digit Even",
        "Digits Digit Over/Digit Under",
        "Higher/Lower",
        "Rise/Fall",
        "Asians",
        "Up/Down",
        "High/Low Ticks"
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
        DAI: { name: 'dai' }
    },
    appSupportedLanguages: ["en", "id", "ru", "zh_tw", "zh_cn", "de", "fr", "pl", "it"]
});
