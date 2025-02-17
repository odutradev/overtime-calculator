import { useState, useEffect, useRef } from 'react';
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
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/UploadFile';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteIcon from '@mui/icons-material/Delete';

const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

interface Day {
  id: number;
  date: string;
  holiday: boolean;
  entrada1: string;
  saida1: string;
  entrada2: string;
  saida2: string;
}

const calculateOvertime = (
  entrada1: string,
  saida1: string,
  entrada2: string,
  saida2: string,
  holiday: boolean
): { overtimeMinutes: number } => {
  const period1 = timeToMinutes(saida1) - timeToMinutes(entrada1);
  const period2 = timeToMinutes(saida2) - timeToMinutes(entrada2);
  const totalMinutes = (period1 > 0 ? period1 : 0) + (period2 > 0 ? period2 : 0);
  if (holiday) return { overtimeMinutes: totalMinutes };
  const standardMinutes = 8 * 60;
  const overtimeMinutes = totalMinutes > standardMinutes ? totalMinutes - standardMinutes : 0;
  return { overtimeMinutes };
};

const formatMinutesToHHMM = (mins: number): string => {
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

function App() {
  const [days, setDays] = useState<Day[]>(() => {
    const stored = localStorage.getItem('days');
    return stored ? JSON.parse(stored) : [];
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('days', JSON.stringify(days));
  }, [days]);

  const addDay = () => {
    const newDay: Day = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      holiday: false,
      entrada1: '09:00',
      saida1: '12:00',
      entrada2: '13:00',
      saida2: '18:00'
    };
    setDays(prev => [...prev, newDay]);
  };

  const updateDay = <K extends keyof Day>(id: number, field: K, value: Day[K]) => {
    setDays(prev => prev.map(day => (day.id === id ? { ...day, [field]: value } : day)));
  };

  const removeDay = (id: number) => {
    setDays(prev => prev.filter(day => day.id !== id));
  };

  const totalOvertimeMinutes = days.reduce((sum, day) => {
    const { overtimeMinutes } = calculateOvertime(
      day.entrada1 || '09:00',
      day.saida1 || '12:00',
      day.entrada2 || '13:00',
      day.saida2 || '18:00',
      day.holiday
    );
    return sum + overtimeMinutes;
  }, 0);

  const handleExport = () => {
    const data = JSON.stringify(days, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dados_horas_extras.json';
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
    reader.onload = event => {
      try {
        const importedDays = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedDays)) setDays(importedDays);
      } catch (err) {
        console.error('Erro ao importar dados', err);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setDays([]);
    localStorage.removeItem('days');
  };

  const dateCounts = days.reduce((acc, day) => {
    acc[day.date] = (acc[day.date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Calculadora de Horas Extras
      </Typography>
      <Typography
        variant="h5"
        align="center"
        sx={{
          backgroundColor: '#2196F3',
          color: 'white',
          px: 3,
          py: 1,
          borderRadius: 2,
          mb: 2,
          boxShadow: 3
        }}
      >
        Saldo Total: {formatMinutesToHHMM(totalOvertimeMinutes)}
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2, maxWidth: 900 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Data</TableCell>
              <TableCell align="center">Feriado</TableCell>
              <TableCell align="center">Entrada 1</TableCell>
              <TableCell align="center">Saída 1</TableCell>
              <TableCell align="center">Entrada 2</TableCell>
              <TableCell align="center">Saída 2</TableCell>
              <TableCell align="center">Saldo do Dia</TableCell>
              <TableCell align="center">Remover</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {days.map(day => {
              const { overtimeMinutes } = calculateOvertime(
                day.entrada1 || '09:00',
                day.saida1 || '12:00',
                day.entrada2 || '13:00',
                day.saida2 || '18:00',
                day.holiday
              );
              return (
                <TableRow key={day.id}>
                  <TableCell
                    align="center"
                    sx={{
                      backgroundColor: dateCounts[day.date] > 1 ? '#e03b4b' : 'inherit'
                    }}
                  >
                    <TextField
                      type="date"
                      value={day.date}
                      onChange={e => updateDay(day.id, 'date', e.target.value)}
                      variant="standard"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={day.holiday}
                      onChange={e => updateDay(day.id, 'holiday', e.target.checked)}
                      sx={{
                        color: '#2196F3',
                        '&.Mui-checked': { color: '#2196F3' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="time"
                      value={day.entrada1 === '' ? '09:00' : day.entrada1}
                      onChange={e => updateDay(day.id, 'entrada1', e.target.value)}
                      inputProps={{ step: 300 }}
                      variant="standard"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="time"
                      value={day.saida1 === '' ? '12:00' : day.saida1}
                      onChange={e => updateDay(day.id, 'saida1', e.target.value)}
                      inputProps={{ step: 300 }}
                      variant="standard"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="time"
                      value={day.entrada2 === '' ? '13:00' : day.entrada2}
                      onChange={e => updateDay(day.id, 'entrada2', e.target.value)}
                      inputProps={{ step: 300 }}
                      variant="standard"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="time"
                      value={day.saida2 === '' ? '18:00' : day.saida2}
                      onChange={e => updateDay(day.id, 'saida2', e.target.value)}
                      inputProps={{ step: 300 }}
                      variant="standard"
                    />
                  </TableCell>
                  <TableCell align="center">{formatMinutesToHHMM(overtimeMinutes)}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Remover dia">
                      <IconButton onClick={() => removeDay(day.id)} sx={{ color: '#2196F3' }}>
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
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Tooltip title="Exportar dados">
          <IconButton onClick={handleExport} sx={{ color: '#2196F3' }}>
            <DownloadIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Importar dados">
          <IconButton onClick={handleImportClick} sx={{ color: '#2196F3' }}>
            <UploadIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Resetar dados">
          <IconButton onClick={handleReset} sx={{ color: '#2196F3' }}>
            <RestartAltIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Adicionar dia">
          <IconButton onClick={addDay} sx={{ color: '#2196F3' }}>
            <AddIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleImport}
        style={{ display: 'none' }}
      />
    </Box>
  );
}

export default App;
