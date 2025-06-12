export interface OvertimeSummaryProps {
    monthNegativeOvertimeMinutes: number;
    totalNegativeOvertimeMinutes: number;
    monthOvertimeMinutes: number;
    totalOvertimeMinutes: number;
    selectedMonth: string;
}

export interface SummaryStatItem {
    backgroundColor: string;
    borderColor: string;
    tooltip: string;
    label: string;
    value: string;
    color: string;
}

export interface SummaryPanel {
    stats: SummaryStatItem[];
    title: string;
}