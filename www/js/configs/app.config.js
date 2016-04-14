/**
 * @contributors []
 * @since 10/25/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.constant('config', {
        'wsUrl': 'wss://ws.binaryws.com/websockets/v3?l=',  // Don't set language value here
        'tradeCategories': [
            {
                name: "Up/Down",
                value: "UP/DOWN"
            },
            {
                name: "Digit Matches/Differs",
                value: "MATCH/DIFF",
                digits: true
            },
            {
                name: "Digit Even/Odd",
                value: "EVEN/ODD"
            },
            {
                name: "Digit Over/Under",
                value: "OVER/UNDER",
                digits: true
            },
        ],
		'tradeTypes': [
			{
				name: 'Up',
				value: 'CALL',
				markets: ['forex', 'volidx', 'random'],
				digits: false,
                category: "UP/DOWN"
			},
			{
				name: 'Down',
				value: 'PUT',
				markets: ['forex', 'volidx', 'random'],
				digits: false,
                category: "UP/DOWN"

			},
			{
				name: 'Digit Match',
				value: 'DIGITMATCH',
				markets: ['volidx', 'random'],
				digits: true,
                category: "MATCH/DIFF"

			},
			{
				name: 'Digit Differs',
				value: 'DIGITDIFF',
				markets: ['volidx', 'random'],
				digits: true,
                category: "MATCH/DIFF"


			},
			{
				name: 'Digit Even',
				value: 'DIGITEVEN',
				markets: ['volidx', 'random'],
                category: "EVEN/ODD"

			},
			{
				name: 'Digit Odd',
				value: 'DIGITODD',
				markets: ['volidx', 'random'],
                category: "EVEN/ODD"

			},
			{
				name: 'Digit Over',
				value: 'DIGITOVER',
				markets: ['volidx', 'random'],
				digits: true,
                category: "OVER/UNDER"

			},
			{
				name: 'Digit Under',
				value: 'DIGITUNDER',
				markets: ['volidx', 'random'],
				digits: true,
                category: "OVER/UNDER"

			}
		],
		'language': 'en',
		'assetIndexes': {
		    symbol: 0,
		    displayName: 1,
		    contracts : 2,
		        contractName: 0,
		        contractDisplayName: 1,
		        contractFrom: 2,
		        contractTo  : 3
		}
});
