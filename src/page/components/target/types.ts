export interface OvertimeTargetProps {
  targetHours: number | '';
  onChange: (value: number | '') => void;
  totalOvertimeMinutes: number;
  onOpenModal: () => void;
}
