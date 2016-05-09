/**
 * @contributors []
 * @since 10/25/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.constant('config', {
        'app_id': "id-ct9oK1jjUNyxvPKYNdqJxuGX7bHvJ",
        'wsUrl': 'wss://ws.binaryws.com/websockets/v3?l=',  // Don't set language value here
        'oauthUrl': 'https://www.binary.com/oauth2/authorize',
        'tradeCategories': [
            {
                name: "Up/Down",
				markets: ['forex', 'volidx', 'random'],
                value: "UP/DOWN"
            },
            {
                name: "Digit Matches/Differs",
                value: "MATCH/DIFF",
				markets: ['volidx', 'random'],
                digits: true
            },
            {
                name: "Digit Even/Odd",
				markets: ['volidx', 'random'],
                value: "EVEN/ODD"
            },
            {
                name: "Digit Over/Under",
                value: "OVER/UNDER",
				markets: ['volidx', 'random'],
                digits: true
            },
            {
                name: "Asians",
                value: "Asians",
                markets: ['volidx', 'random']
            }
        ],
		'tradeTypes': [
			{
				name: 'Up',
				value: 'CALL',
				digits: false,
                category: "UP/DOWN"
			},
			{
				name: 'Down',
				value: 'PUT',
				digits: false,
                category: "UP/DOWN"

			},
			{
                name: 'Asians Up',
				value: 'ASIANU',
				digits: false,
                category: "Asians"

			},
			{
                name: 'Asians Down',
				value: 'ASIAND',
				digits: false,
                category: "Asians"

			},
			{
				name: 'Digit Match',
				value: 'DIGITMATCH',
				digits: true,
                category: "MATCH/DIFF"

			},
			{
				name: 'Digit Differs',
				value: 'DIGITDIFF',
				digits: true,
                category: "MATCH/DIFF"


			},
			{
				name: 'Digit Even',
				value: 'DIGITEVEN',
                category: "EVEN/ODD"

			},
			{
				name: 'Digit Odd',
				value: 'DIGITODD',
                category: "EVEN/ODD"

			},
			{
				name: 'Digit Over',
				value: 'DIGITOVER',
				digits: true,
                category: "OVER/UNDER"

			},
			{
				name: 'Digit Under',
				value: 'DIGITUNDER',
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
