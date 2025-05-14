import { Day } from "../../types";

export interface OvertimeTableProps {
  days: Day[];
  updateDay: <K extends keyof Day>(
    id: number,
    field: K,
    value: Day[K]
  ) => void;
  removeDay: (id: number) => void;
}
