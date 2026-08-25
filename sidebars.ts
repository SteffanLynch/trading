import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  library: [
    {
      type: 'category',
      label: 'Orientation',
      collapsible: false,
      items: ['README', 'manifesto'],
    },
    {
      type: 'category',
      label: 'Fundamentals',
      collapsible: true,
      items: [
        'fundamentals/what-is-trading',
        'fundamentals/market-fundamentals',
        'fundamentals/market-nature',
        'fundamentals/market-structure',
        'fundamentals/timeframes',
        'fundamentals/support-and-resistance',
        'fundamentals/candlesticks',
        'fundamentals/risk-management',
        'fundamentals/trading-psychology',
      ],
    },
    {
      type: 'category',
      label: 'Strategy',
      collapsible: true,
      items: [
        'strategy/what-is-a-trading-plan',
        'strategy/rules',
        {
          type: 'category',
          label: 'Supply & demand',
          items: [
            'strategy/supply-and-demand/supply-and-demand',
            'strategy/supply-and-demand/behind-the-candles',
            {
              type: 'category',
              label: 'Chart studies',
              items: [
                'strategy/supply-and-demand/examples/simple-sell-example',
                'strategy/supply-and-demand/examples/back-to-back-opposite-example',
                'strategy/supply-and-demand/examples/triple-top-sell-example',
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsible: false,
      items: ['glossary'],
    },
  ],
};

export default sidebars;
