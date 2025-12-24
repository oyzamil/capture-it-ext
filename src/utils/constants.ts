export const gradientPresets = [
  {
    label: 'Default Gradients',
    defaultOpen: true,
    colors: [
      [
        { color: '#f9a8d4', percent: 0 },
        { color: '#fed7aa', percent: 50 },
        { color: '#fca5a5', percent: 100 },
      ],
      [
        { color: '#86efac', percent: 0 },
        { color: '#fef08a', percent: 50 },
        { color: '#bbf7d0', percent: 100 },
      ],
      [
        { color: '#bbf7d0', percent: 0 },
        { color: '#bfdbfe', percent: 50 },
        { color: '#93c5fd', percent: 100 },
      ],
      [
        { color: '#c7d2fe', percent: 0 },
        { color: '#60a5fa', percent: 50 },
        { color: '#8b5cf6', percent: 100 },
      ],
      [
        { color: '#fca5a5', percent: 0 },
        { color: '#fdba74', percent: 50 },
        { color: '#fde68a', percent: 100 },
      ],
      [
        { color: '#f9a8d4', percent: 0 },
        { color: '#f472b6', percent: 50 },
        { color: '#f87171', percent: 100 },
      ],
      [
        { color: '#94a3b8', percent: 0 },
        { color: '#6b7280', percent: 50 },
        { color: '#374151', percent: 100 },
      ],
      [
        { color: '#fdba74', percent: 0 },
        { color: '#fb923c', percent: 50 },
        { color: '#f87171', percent: 100 },
      ],
      [
        { color: '#5eead4', percent: 0 },
        { color: '#22d3ee', percent: 100 },
      ],
      [
        { color: '#f87171', percent: 0 },
        { color: '#9333ea', percent: 100 },
      ],
      [
        { color: '#af6dff', percent: 0 },
        { color: '#ffebaa', percent: 100 },
      ],
      [
        { color: hexToShade(useAppConfig().APP.color, 10, true), percent: 0 },
        { color: useAppConfig().APP.color, percent: 100 },
      ],
    ],
  },
  {
    label: 'Default Colors',
    defaultOpen: true,
    colors: ['#ffffff', '#000000', useAppConfig().APP.color],
  },
];
