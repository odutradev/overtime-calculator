import { useState, useEffect, useRef } from "react";
import {
  Box,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Typography,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";


import { calculateOvertime, formatMinutesToHHMM, getYearMonth, formatYearMonth } from "./utils";
import type { Day } from "./types";
import Charts from "./components/charts";
import {ChartData} from "./components/charts/types";
import Summary from "./components/summary";

const App = () => {
  const [days, setDays] = useState<Day[]>(() => {
    const stored = localStorage.getItem("days");
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });
  const [targetHours, setTargetHours] = useState<number | "">(() => {
    const saved = localStorage.getItem("targetHours");
    return saved !== null ? Number(saved) : "";
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
        day.holiday
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

    const chartData: ChartData[] = calculateOvertimeByMonth().map(({ name, value, formattedValue }) => ({
    name,
    value,
    formattedValue,
  }));

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
      day.holiday
    );
    return sum + overtimeMinutes;
  }, 0);
  const totalNegativeOvertimeMinutes = days.reduce((sum, day) => {
    const { overtimeMinutes } = calculateOvertime(
      day.entrada1 || "09:00",
      day.saida1 || "12:00",
      day.entrada2 || "13:00",
      day.saida2 || "18:00",
      day.holiday
    );
    return overtimeMinutes < 0 ? sum + overtimeMinutes : sum;
  }, 0);
  const monthOvertimeMinutes = filteredDays.reduce((sum, day) => {
    const { overtimeMinutes } = calculateOvertime(
      day.entrada1 || "09:00",
      day.saida1 || "12:00",
      day.entrada2 || "13:00",
      day.saida2 || "18:00",
      day.holiday
    );
    return sum + overtimeMinutes;
  }, 0);
  const monthNegativeOvertimeMinutes = filteredDays.reduce((sum, day) => {
    const { overtimeMinutes } = calculateOvertime(
      day.entrada1 || "09:00",
      day.saida1 || "12:00",
      day.entrada2 || "13:00",
      day.saida2 || "18:00",
      day.holiday
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
        if (Array.isArray(importedDays)) setDays(importedDays);
      } catch (err) {
        console.error("Erro ao importar dados", err);
      }
    };
    reader.readAsText(file);
  };

  const dateCounts = days.reduce((acc, day) => {
    acc[day.date] = (acc[day.date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const targetMinutes = typeof targetHours === "number" ? targetHours * 60 : 0;
  const missingMinutes =
    typeof targetHours === "number"
      ? Math.max(0, targetMinutes - totalOvertimeMinutes)
      : 0;
  const alternatives = [
    { label: "2 horas por dia", minutes: 120 },
    { label: "1:30 por dia", minutes: 90 },
    { label: "1 hora por dia", minutes: 60 },
    { label: "30 minutos por dia", minutes: 30 },
  ];

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


          <Box
            sx={{
              width: "100%",
              maxWidth: 900,
              border: "1px solid #333",
              borderRadius: 2,
              bgcolor: "#252525",
              p: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                mb: 2,
                color: "#bbbbbb",
                textAlign: "center",
              }}
            >
              Distribuição de Horas Extras por Mês
            </Typography>
      <Charts
        data={chartData}
        width="100%"
        height={300}
      />
          </Box>
        </Box>

        
      </Paper>
      <Paper
        sx={{
          width: "100%",
          maxWidth: 900,
          mb: 4,
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "#1e1e1e",
          border: "1px solid #333",
          p: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", mb: 2, color: "#ffffff" }}
        >
          Meta de Horas
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            label="Meta (horas)"
            type="number"
            value={targetHours}
            onChange={(e) =>
              setTargetHours(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            variant="standard"
            InputLabelProps={{ shrink: true }}
            sx={{
              "& input": { color: "#e0e0e0" },
              "& .MuiInput-underline:before": { borderBottomColor: "#555" },
              "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                borderBottomColor: "#777",
              },
              "& .MuiInput-underline:after": { borderBottomColor: "#2196F3" },
              flex: 1,
            }}
          />
          <Box
            onClick={() => setOpenModal(true)}
            sx={{
              cursor: "pointer",
              p: 2,
              border: "1px solid #333",
              borderRadius: 2,
              bgcolor: "#252525",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography sx={{ color: "#e0e0e0", fontWeight: "bold" }}>
              Meta: {targetHours !== "" ? `${targetHours} horas` : "---"}
            </Typography>
            <Typography sx={{ color: "#e0e0e0", fontWeight: "bold" }}>
              {targetHours !== ""
                ? targetMinutes <= totalOvertimeMinutes
                  ? "Meta Atingida"
                  : `Faltam: ${formatMinutesToHHMM(
                      targetMinutes - totalOvertimeMinutes
                    )}`
                : "Meta não definida"}
            </Typography>
            <Typography sx={{ color: "#2196F3" }}>
              Clique para ver previsões
            </Typography>
          </Box>
        </Box>
      </Paper>
      <TableContainer
        component={Paper}
        sx={{
          mt: 2,
          maxWidth: 900,
          bgcolor: "#1e1e1e",
          border: "1px solid #333",
          borderRadius: 2,
          boxShadow: "0 4px 6px rgba(0,0,0,0.4)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#2c2c2c" }}>
              <TableCell
                align="center"
                sx={{ color: "#ffffff", borderBottom: "1px solid #333" }}
              >
                Data
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: "#ffffff", borderBottom: "1px solid #333" }}
              >
                Feriado
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: "#ffffff", borderBottom: "1px solid #333" }}
              >
                Entrada 1
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: "#ffffff", borderBottom: "1px solid #333" }}
              >
                Saída 1
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: "#ffffff", borderBottom: "1px solid #333" }}
              >
                Entrada 2
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: "#ffffff", borderBottom: "1px solid #333" }}
              >
                Saída 2
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: "#ffffff", borderBottom: "1px solid #333" }}
              >
                Saldo do Dia
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: "#ffffff", borderBottom: "1px solid #333" }}
              >
                Remover
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFilteredDays.map((day) => {
              const { overtimeMinutes } = calculateOvertime(
                day.entrada1 || "09:00",
                day.saida1 || "12:00",
                day.entrada2 || "13:00",
                day.saida2 || "18:00",
                day.holiday
              );
              return (
                <TableRow
                  key={day.id}
                  sx={{
                    "&:nth-of-type(odd)": { bgcolor: "#252525" },
                    "&:nth-of-type(even)": { bgcolor: "#1e1e1e" },
                    "&:hover": { bgcolor: "#303030" },
                  }}
                >
                  <TableCell
                    align="center"
                    sx={{
                      color: "#e0e0e0",
                      borderBottom: "1px solid #333",
                      backgroundColor:
                        dateCounts[day.date] > 1
                          ? "rgba(224, 59, 75, 0.2)"
                          : "inherit",
                    }}
                  >
                    <TextField
                      type="date"
                      value={day.date}
                      onChange={(e) =>
                        updateDay(day.id, "date", e.target.value)
                      }
                      variant="standard"
                      sx={{
                        "& input": { color: "#e0e0e0" },
                        "& .MuiInput-underline:before": {
                          borderBottomColor: "#555",
                        },
                        "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                          { borderBottomColor: "#777" },
                        "& .MuiInput-underline:after": {
                          borderBottomColor: "#2196F3",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderBottom: "1px solid #333" }}
                  >
                    <Checkbox
                      checked={day.holiday}
                      onChange={(e) =>
                        updateDay(day.id, "holiday", e.target.checked)
                      }
                      sx={{
                        color: "#666",
                        "&.Mui-checked": { color: "#2196F3" },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#e0e0e0", borderBottom: "1px solid #333" }}
                  >
                    <TextField
                      type="time"
                      value={day.entrada1 === "" ? "09:00" : day.entrada1}
                      onChange={(e) =>
                        updateDay(day.id, "entrada1", e.target.value)
                      }
                      inputProps={{ step: 300 }}
                      variant="standard"
                      sx={{
                        "& input": { color: "#e0e0e0" },
                        "& .MuiInput-underline:before": {
                          borderBottomColor: "#555",
                        },
                        "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                          { borderBottomColor: "#777" },
                        "& .MuiInput-underline:after": {
                          borderBottomColor: "#2196F3",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#e0e0e0", borderBottom: "1px solid #333" }}
                  >
                    <TextField
                      type="time"
                      value={day.saida1 === "" ? "12:00" : day.saida1}
                      onChange={(e) =>
                        updateDay(day.id, "saida1", e.target.value)
                      }
                      inputProps={{ step: 300 }}
                      variant="standard"
                      sx={{
                        "& input": { color: "#e0e0e0" },
                        "& .MuiInput-underline:before": {
                          borderBottomColor: "#555",
                        },
                        "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                          { borderBottomColor: "#777" },
                        "& .MuiInput-underline:after": {
                          borderBottomColor: "#2196F3",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#e0e0e0", borderBottom: "1px solid #333" }}
                  >
                    <TextField
                      type="time"
                      value={day.entrada2 === "" ? "13:00" : day.entrada2}
                      onChange={(e) =>
                        updateDay(day.id, "entrada2", e.target.value)
                      }
                      inputProps={{ step: 300 }}
                      variant="standard"
                      sx={{
                        "& input": { color: "#e0e0e0" },
                        "& .MuiInput-underline:before": {
                          borderBottomColor: "#555",
                        },
                        "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                          { borderBottomColor: "#777" },
                        "& .MuiInput-underline:after": {
                          borderBottomColor: "#2196F3",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ color: "#e0e0e0", borderBottom: "1px solid #333" }}
                  >
                    <TextField
                      type="time"
                      value={day.saida2 === "" ? "18:00" : day.saida2}
                      onChange={(e) =>
                        updateDay(day.id, "saida2", e.target.value)
                      }
                      inputProps={{ step: 300 }}
                      variant="standard"
                      sx={{
                        "& input": { color: "#e0e0e0" },
                        "& .MuiInput-underline:before": {
                          borderBottomColor: "#555",
                        },
                        "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                          { borderBottomColor: "#777" },
                        "& .MuiInput-underline:after": {
                          borderBottomColor: "#2196F3",
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: overtimeMinutes >= 0 ? "#4CAF50" : "#f44336",
                      fontWeight: "bold",
                      borderBottom: "1px solid #333",
                    }}
                  >
                    {formatMinutesToHHMM(overtimeMinutes)}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ borderBottom: "1px solid #333" }}
                  >
                    <Tooltip title="Remover dia">
                      <IconButton
                        onClick={() => removeDay(day.id)}
                        sx={{ color: "#2196F3" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
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
        <Tooltip title="Exportar dados">
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
        <Tooltip title="Importar dados">
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
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Previsão para atingir a meta</DialogTitle>
        <DialogContent>
          {targetHours !== "" ? (
            missingMinutes > 0 ? (
              alternatives.map((option, index) => (
                <Typography key={index} sx={{ mb: 1 }}>
                  {option.label}: {Math.ceil(missingMinutes / option.minutes)}{" "}
                  dia(s)
                </Typography>
              ))
            ) : (
              <Typography>Meta atingida!</Typography>
            )
          ) : (
            <Typography>Meta não definida.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)} sx={{ color: "#2196F3" }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default App;
