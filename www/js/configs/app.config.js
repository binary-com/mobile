/**
 * @name app.config
 * @author Massih Hazrati
 * @contributors []
 * @since 10/25/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.constant('config', {
		'tradeTypes': [
			{
				name: 'Up',
				value: 'CALL',
				markets: ['forex', 'random'],
				digits: false
			},
			{
				name: 'Down',
				value: 'PUT',
				markets: ['forex', 'random'],
				digits: false
			},
			{
				name: 'Digit Match',
				value: 'DIGITMATCH',
				markets: ['random'],
				digits: true
			},
			{
				name: 'Digit Differs',
				value: 'DIGITDIFF',
				markets: ['random'],
				digits: true
			}
		],
		'language': 'en'
});
