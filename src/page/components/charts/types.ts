export interface ChartData {
  name: string;
  value: number;
}

export interface OvertimeChartProps {
    height?: number | string;
    width?: number | string;
    data: ChartData[];
    colors?: string[];
}