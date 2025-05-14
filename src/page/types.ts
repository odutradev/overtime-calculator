export interface Day {
    holiday: boolean;
    entrada1: string;
    entrada2: string;
    saida1: string;
    saida2: string;
    date: string;
    id: number;
};

export interface OvertimeResult {
    overtimeMinutes: number;
};

export interface MonthlyOvertime {
    formattedValue: string;
    value: number;
    name: string;
};