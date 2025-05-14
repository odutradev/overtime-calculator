export interface OvertimeTargetProps {
    onChange: (value: number | '') => void;
    totalOvertimeMinutes: number;
    targetHours: number | '';
    onOpenModal: () => void;
}
