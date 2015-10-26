/**
 * @name config.dev
 * @author Massih Hazrati
 * @contributors []
 * @since 10/25/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.constant('config.dev', {
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
		'defaults': {
			'market': 'forex',
			'trade-type': 'up',
			'ticks': 5,
			'payout': 'payout'
		},
		'language': 'en'
});
