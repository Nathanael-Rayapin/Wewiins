export interface IStatisticKPIs {
    label: string;
    value: number;
    hasTooltip: boolean;
    tooltipValue?: string;
    unit?: string;
}

export interface IVoteDistribution {
  star: number;
  count: number; 
}