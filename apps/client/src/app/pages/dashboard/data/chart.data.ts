import { signal } from "@angular/core";

interface ChartRevenueData {
  datasets: RevenueDataset[];
}

interface RevenueDataset {
  data: number[];
  backgroundColor: string[];
  cutout: string;
  label: string;
}

export const chartRevenueData = signal<ChartRevenueData>({
    datasets: [
      {
        data: [],
        backgroundColor: [
            '#C60541',
            '#FFCE35',
            '#49A3A3'
        ],
        cutout: '70%',
        label: 'Revenue'
    }
  ],
});

interface ChartRevenueOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
}

export const chartRevenueOptions: ChartRevenueOptions = {
    responsive: false,
    maintainAspectRatio: false
};