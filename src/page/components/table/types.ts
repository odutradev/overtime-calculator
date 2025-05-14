import type { Day } from "../../types";

export interface OvertimeTableProps {
    updateDay: <K extends keyof Day>(id: number, field: K, value: Day[K]) => void;
    removeDay: (id: number) => void;
    days: Day[];
}
