import { useState, useEffect, useRef } from "react";
import { Box, IconButton, Paper, Typography, Tooltip, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from "@mui/material";
import UploadIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import { calculateOvertime, formatMinutesToHHMM, getYearMonth, formatYearMonth, exportToPDF } from "./utils";
import Forecast from "./components/forecast";
import Summary from "./components/summary";
import Charts from "./components/charts";
import Target from "./components/target";
import Table from "./components/table";

import type { ChartData } from "./components/charts/types";
import type { Day } from "./types";

const App = () => {
  const [days, setDays] = useState<Day[]>(() => {
    const stored = localStorage.getItem("days");
    const parsedDays = stored ? JSON.parse(stored) : [];
    return parsedDays.map((day: any) => ({
      ...day,
      ignored: day.ignored ?? false,
      didNotWork: day.didNotWork ?? false
    }));
  });
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2,"0")}`;
  });
  const [targetHours, setTargetHours] = useState<number | "">(() => {
    const saved = localStorage.getItem("targetHours");
    return saved !== null ? Number(saved) : "";
  });
  const [toleranceEnabled, setToleranceEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("toleranceEnabled");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [openModal, setOpenModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem("days", JSON.stringify(days));
  }, [days]);

  useEffect(() => {
    if (targetHours === "") {
      localStorage.removeItem("targetHours");
    } else {
      localStorage.setItem("targetHours", String(targetHours));
    }
  }, [targetHours]);

  useEffect(() => {
    localStorage.setItem("toleranceEnabled", JSON.stringify(toleranceEnabled));
  }, [toleranceEnabled]);

  const calculateOvertimeByMonth = () => {
    const monthlyData: Record<string, number> = {};
    days.forEach((day) => {
      const yearMonth = getYearMonth(day.date);
      if (!yearMonth) return;
      const { overtimeMinutes } = calculateOvertime(
        day.entrada1 || "09:00",
        day.saida1 || "12:00",
        day.entrada2 || "13:00",
        day.saida2 || "18:00",
        day.holiday,
        day.ignored,
        toleranceEnabled,
        day.didNotWork
      );
      if (overtimeMinutes > 0) {
        monthlyData[yearMonth] =
          (monthlyData[yearMonth] || 0) + overtimeMinutes;
      }
    });
    return Object.entries(monthlyData).map(([month, minutes]) => ({
      name: formatYearMonth(month),
      value: minutes,
      formattedValue: formatMinutesToHHMM(minutes),
    }));
  };

  const chartData: ChartData[] = calculateOvertimeByMonth().map(
    ({ name, value, formattedValue }) => ({
      name,
      value,
      formattedValue,
    })
  );

  const addDay = () => {
    const [selectedYear, selectedMonthNum] = selectedMonth
      .split("-")
      .map(Number);
    const daysInSelectedMonth = days
      .filter((day) => {
        const [year, month] = day.date.split("-").map(Number);
        return year === selectedYear && month === selectedMonthNum;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
    let newDayNumber = 1;
    if (daysInSelectedMonth.length > 0) {
      const lastDay = daysInSelectedMonth[daysInSelectedMonth.length - 1];
      const lastDate = new Date(lastDay.date);
      newDayNumber = lastDate.getDate() + 1;
    }
    const lastDayOfMonth = new Date(
      selectedYear,
      selectedMonthNum,
      0
    ).getDate();
    if (newDayNumber > lastDayOfMonth) newDayNumber = lastDayOfMonth;
    const formattedDate = `${selectedYear}-${String(selectedMonthNum).padStart(
      2,
      "0"
    )}-${String(newDayNumber).padStart(2, "0")}`;
    const newDay: Day = {
      id: Date.now(),
      date: formattedDate,
      holiday: false,
      ignored: false,
      didNotWork: false,
      entrada1: "09:00",
      saida1: "12:00",
      entrada2: "13:00",
      saida2: "18:00",
    };
    setDays((prev) => [...prev, newDay]);
  };

  const updateDay = <K extends keyof Day>(
    id: number,
    field: K,
    value: Day[K]
  ) => {
    setDays((prev) =>
      prev.map((day) => (day.id === id ? { ...day, [field]: value } : day))
    );
  };

  const removeDay = (id: number) => {
    setDays((prev) => prev.filter((day) => day.id !== id));
  };

  const availableMonths = [
    ...new Set(days.map((day) => getYearMonth(day.date))),
  ].sort();
  const filteredDays = days.filter(
    (day) => getYearMonth(day.date) === selectedMonth
  );
  const sortedFilteredDays = [...filteredDays].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
  const totalOvertimeMinutes = days.reduce((sum, day) => {
    const { overtimeMinutes } = calculateOvertime(
      day.entrada1 || "09:00",
      day.saida1 || "12:00",
      day.entrada2 || "13:00",
      day.saida2 || "18:00",
      day.holiday,
      day.ignored,
      toleranceEnabled,
      day.didNotWork
    );
    return sum + overtimeMinutes;
  }, 0);
  const totalNegativeOvertimeMinutes = days.reduce((sum, day) => {
    const { overtimeMinutes } = calculateOvertime(
      day.entrada1 || "09:00",
      day.saida1 || "12:00",
      day.entrada2 || "13:00",
      day.saida2 || "18:00",
      day.holiday,
      day.ignored,
      toleranceEnabled,
      day.didNotWork
    );
    return overtimeMinutes < 0 ? sum + overtimeMinutes : sum;
  }, 0);
  const monthOvertimeMinutes = filteredDays.reduce((sum, day) => {
    const { overtimeMinutes } = calculateOvertime(
      day.entrada1 || "09:00",
      day.saida1 || "12:00",
      day.entrada2 || "13:00",
      day.saida2 || "18:00",
      day.holiday,
      day.ignored,
      toleranceEnabled,
      day.didNotWork
    );
    return sum + overtimeMinutes;
  }, 0);
  const monthNegativeOvertimeMinutes = filteredDays.reduce((sum, day) => {
    const { overtimeMinutes } = calculateOvertime(
      day.entrada1 || "09:00",
      day.saida1 || "12:00",
      day.entrada2 || "13:00",
      day.saida2 || "18:00",
      day.holiday,
      day.ignored,
      toleranceEnabled,
      day.didNotWork
    );
    return overtimeMinutes < 0 ? sum + overtimeMinutes : sum;
  }, 0);

  const handleExport = () => {
    const data = JSON.stringify(days, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dados_horas_extras.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedDays = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedDays)) {
          const normalizedDays = importedDays.map((day: any) => ({
            ...day,
            ignored: day.ignored ?? false,
            didNotWork: day.didNotWork ?? false
          }));
          setDays(normalizedDays);
        }
      } catch (err) {
        console.error("Erro ao importar dados", err);
      }
    };
    reader.readAsText(file);
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(days, selectedMonth, toleranceEnabled);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    }
  };

  const targetMinutes = typeof targetHours === "number" ? targetHours * 60 : 0;
  const missingMinutes =
    typeof targetHours === "number"
      ? Math.max(0, targetMinutes - totalOvertimeMinutes)
      : 0;

  const handleOpenModal = () => setOpenModal(true);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 4,
        bgcolor: "#121212",
        minHeight: "100vh",
        color: "#e0e0e0",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ mb: 3, color: "#ffffff" }}
      >
        Calculadora de Horas Extras
      </Typography>
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 900,
          mb: 4,
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "#1e1e1e",
          border: "1px solid #333",
        }}
      >
        <Box
          sx={{
            bgcolor: "#2c2c2c",
            color: "#ffffff",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #333",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Painel de Controle
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={toleranceEnabled}
                  onChange={(e) => setToleranceEnabled(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#4CAF50',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#4CAF50',
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon sx={{ color: "#9e9e9e", fontSize: "1.2rem" }} />
                  <Typography sx={{ color: "#e0e0e0", fontSize: "0.9rem" }}>
                    Tolerância 10min
                  </Typography>
                </Box>
              }
              sx={{ 
                margin: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.9rem'
                }
              }}
            />
            <FormControl
              sx={{ minWidth: 220, bgcolor: "#121212", borderRadius: 1 }}
            >
              <InputLabel id="month-select-label" sx={{ color: "#9e9e9e" }}>
                Selecione o Mês
              </InputLabel>
              <Select
                labelId="month-select-label"
                id="month-select"
                value={selectedMonth}
                label="Selecione o Mês"
                onChange={(e) => setSelectedMonth(e.target.value)}
                size="small"
                sx={{
                  color: "#ffffff",
                  ".MuiOutlinedInput-notchedOutline": {
                    borderColor: "#555",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#777",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#2196F3",
                  },
                  ".MuiSvgIcon-root": {
                    color: "#9e9e9e",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: "#1e1e1e",
                      color: "#e0e0e0",
                      border: "1px solid #333",
                    },
                  },
                }}
              >
                {availableMonths.map((month) => (
                  <MenuItem key={month} value={month}>
                    {formatYearMonth(month)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Summary
            totalOvertimeMinutes={totalOvertimeMinutes}
            totalNegativeOvertimeMinutes={totalNegativeOvertimeMinutes}
            monthOvertimeMinutes={monthOvertimeMinutes}
            monthNegativeOvertimeMinutes={monthNegativeOvertimeMinutes}
            selectedMonth={selectedMonth}
          />

          <Charts data={chartData} width="100%" height={300} />
        </Box>
      </Paper>
      <Target
        targetHours={targetHours}
        onChange={setTargetHours}
        totalOvertimeMinutes={totalOvertimeMinutes}
        onOpenModal={handleOpenModal}
      />
      <Table
        days={sortedFilteredDays}
        updateDay={updateDay}
        removeDay={removeDay}
        toleranceEnabled={toleranceEnabled}
      />
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 3,
          justifyContent: "center",
          bgcolor: "#252525",
          p: 2,
          borderRadius: 2,
          border: "1px solid #333",
          maxWidth: 900,
          width: "100%",
        }}
      >
        <Tooltip title="Exportar dados JSON">
          <IconButton
            onClick={handleExport}
            sx={{
              color: "#2196F3",
              bgcolor: "#1a1a1a",
              "&:hover": {
                bgcolor: "#333",
              },
              p: 1.5,
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            <DownloadIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Importar dados JSON">
          <IconButton
            onClick={handleImportClick}
            sx={{
              color: "#2196F3",
              bgcolor: "#1a1a1a",
              "&:hover": {
                bgcolor: "#333",
              },
              p: 1.5,
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            <UploadIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Exportar relatório PDF do mês">
          <IconButton
            onClick={handleExportPDF}
            sx={{
              color: "#FF5722",
              bgcolor: "#1a1a1a",
              "&:hover": {
                bgcolor: "#333",
              },
              p: 1.5,
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            <PictureAsPdfIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Adicionar dia">
          <IconButton
            onClick={addDay}
            sx={{
              color: "#4CAF50",
              bgcolor: "#1a1a1a",
              "&:hover": {
                bgcolor: "#333",
              },
              p: 1.5,
              boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            <AddIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleImport}
        style={{ display: "none" }}
      />
      <Forecast
        open={openModal}
        onClose={() => setOpenModal(false)}
        targetHours={targetHours}
        missingMinutes={missingMinutes}
      />
    </Box>
  );
};

export default App;