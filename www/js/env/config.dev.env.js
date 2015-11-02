/**
 * @name config.dev
 * @author Massih Hazrati
 * @contributors []
 * @since 10/25/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.constant('config', {
		'markets': {
			'forex': {
				'submarket': '',
				'trade_type': ['up', 'down'],
				'duration_type': 'tick'
			},
			'random': {
				'submarket': '',
				'trade_type': ['up', 'down', 'digits'],
				'duration_type': 'tick'
			}
		},
		'default': {
			'market': 'random',
			'trade-type': 'PUT',
			'ticks': 5,
			'payout': 'stake',
			'proposal': {
				'proposal': '1',
				'symbol': 'R_25',
				'contract_type': 'PUT',
				'duration': '5',
				'basis': 'stake',
				'currency': 'USD',
				'amount': '5',
				'duration_unit': 't'
			}
		},
		'language': 'en'
});
