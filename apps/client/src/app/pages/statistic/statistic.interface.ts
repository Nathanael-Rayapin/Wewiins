type StatisticKpiKey =
  | 'averageOccupancy'
  | 'averageCancellation'
  | 'averageParticipants'
  | 'totalFavorites';

export interface IStatisticKPIs {
  label: string;
  value: number;
  name: StatisticKpiKey;
  hasTooltip: boolean;
  tooltipValue?: string;
  unit?: string;
}

interface IChartDataset {
  label: string;
  backgroundColor: string | string[];
  data: number[];
  barPercentage: number;
  categoryPercentage: number;
  borderRadius: number;
}

export interface IChartData {
  labels: string[];
  datasets: IChartDataset[];
}

interface IChartScaleTicks {
  stepSize: number;
}

interface IChartScale {
  ticks: IChartScaleTicks;
}

export interface IChartOptions {
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      display: boolean;
    };
  };
  scales: {
    y: IChartScale;
  };
}