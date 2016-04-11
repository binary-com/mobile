/**
 * @contributors []
 * @since 10/25/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.constant('config', {
        'app_id': "id-ct9oK1jjUNyxvPKYNdqJxuGX7bHvJ",
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
				markets: ['forex', 'random'],
				digits: false,
                category: "UP/DOWN"
			},
			{
				name: 'Down',
				value: 'PUT',
				markets: ['forex', 'random'],
				digits: false,
                category: "UP/DOWN"

			},
			{
				name: 'Digit Match',
				value: 'DIGITMATCH',
				markets: ['random'],
				digits: true,
                category: "MATCH/DIFF"

			},
			{
				name: 'Digit Differs',
				value: 'DIGITDIFF',
				markets: ['random'],
				digits: true,
                category: "MATCH/DIFF"


			},
			{
				name: 'Digit Even',
				value: 'DIGITEVEN',
				markets: ['random'],
                category: "EVEN/ODD"

			},
			{
				name: 'Digit Odd',
				value: 'DIGITODD',
				markets: ['random'],
                category: "EVEN/ODD"

			},
			{
				name: 'Digit Over',
				value: 'DIGITOVER',
				markets: ['random'],
				digits: true,
                category: "OVER/UNDER"

			},
			{
				name: 'Digit Under',
				value: 'DIGITUNDER',
				markets: ['random'],
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
