export interface ForecastOption {
    minutes: number;
    label: string;
};

export interface OvertimeForecastProps {
    alternatives?: ForecastOption[];
    targetHours: number | '';
    missingMinutes: number;
    onClose: () => void;
    open: boolean;
};
