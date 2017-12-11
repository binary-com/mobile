angular.module("binary").constant("realAccountOpeningOptions", {
        salutation: [
            {
                text: 'newaccountreal.select',
                value: '',
                disabled: true
            },
            {
                text: 'newaccountreal.mr',
                value: 'Mr',
            },
            {
                text: 'newaccountreal.mrs',
                value: 'Mrs',
            },
            {
                text: 'newaccountreal.miss',
                value: 'Miss',
            },
            {
                text: 'newaccountreal.ms',
                value: 'Ms',
            }
        ],
        account_opening_reason: [
            {
                text: 'newaccountreal.select',
                value: '',
                disabled: true
            },
            {
                text: 'newaccountreal.speculative',
                value: 'Speculative',
            },
            {
                text: 'newaccountreal.income_earning',
                value: 'Income Earning',
            },
            {
                text: 'newaccountreal.hedging',
                value: 'Hedging',
            },
        ]
});

