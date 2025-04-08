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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

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
  const totalMinutes = period1 + period2;
  if (holiday) return { overtimeMinutes: totalMinutes };
  const standardMinutes = 8 * 60;
  const overtimeMinutes = totalMinutes - standardMinutes;
  return { overtimeMinutes };
};

const formatMinutesToHHMM = (mins: number): string => {
  const sign = mins < 0 ? '-' : '';
  const absMins = Math.abs(mins);
  const hours = Math.floor(absMins / 60);
  const minutes = absMins % 60;
  return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Função para extrair o ano e mês de uma data no formato "YYYY-MM-DD"
const getYearMonth = (dateStr: string): string => {
  if (!dateStr) return '';
  return dateStr.substring(0, 7); // Retorna "YYYY-MM"
};

// Função para formatar o ano-mês para exibição
const formatYearMonth = (yearMonth: string): string => {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${monthNames[parseInt(month) - 1]} de ${year}`;
};

function App() {
  const [days, setDays] = useState<Day[]>(() => {
    const stored = localStorage.getItem('days');
    return stored ? JSON.parse(stored) : [];
  });
  
  // Novo estado para armazenar o mês selecionado (formato: "YYYY-MM")
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    // Inicializa com o mês atual
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cores para o gráfico de pizza
  const COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#f44336', '#9C27B0', '#00BCD4', '#FFEB3B', '#E91E63'];

  useEffect(() => {
    localStorage.setItem('days', JSON.stringify(days));
  }, [days]);

  // Função para calcular a distribuição de horas extras por mês
  const calculateOvertimeByMonth = () => {
    const monthlyData: Record<string, number> = {};
    
    // Agrupar e somar horas extras positivas por mês
    days.forEach(day => {
      const yearMonth = getYearMonth(day.date);
      if (!yearMonth) return;
      
      const { overtimeMinutes } = calculateOvertime(
        day.entrada1 || '09:00',
        day.saida1 || '12:00',
        day.entrada2 || '13:00',
        day.saida2 || '18:00',
        day.holiday
      );
      
      // Apenas considerar horas extras positivas para o gráfico
      if (overtimeMinutes > 0) {
        monthlyData[yearMonth] = (monthlyData[yearMonth] || 0) + overtimeMinutes;
      }
    });
    
    // Converter para o formato esperado pelo Recharts
    return Object.entries(monthlyData).map(([month, minutes]) => ({
      name: formatYearMonth(month),
      value: minutes,
      formattedValue: formatMinutesToHHMM(minutes)
    }));
  };

  const addDay = () => {
    const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
  
    const daysInSelectedMonth = days
      .filter(day => {
        const [year, month] = day.date.split('-').map(Number);
        return year === selectedYear && month === selectedMonthNum;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  
    let newDayNumber = 1;
    if (daysInSelectedMonth.length > 0) {
      const lastDay = daysInSelectedMonth[daysInSelectedMonth.length - 1];
      const lastDate = new Date(lastDay.date);
      newDayNumber = lastDate.getDate() + 1;
    }
  
    const lastDayOfMonth = new Date(selectedYear, selectedMonthNum, 0).getDate();
    if (newDayNumber > lastDayOfMonth) newDayNumber = lastDayOfMonth;
  
    const formattedDate = `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}-${String(newDayNumber).padStart(2, '0')}`;
  
    const newDay: Day = {
      id: Date.now(),
      date: formattedDate,
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

  // Obtém lista única de meses disponíveis
  const availableMonths = [...new Set(days.map(day => getYearMonth(day.date)))].sort();

  // Filtra dias pelo mês selecionado
  const filteredDays = days.filter(day => getYearMonth(day.date) === selectedMonth);
  
  // Ordena os dias por data (do menor para o maior)
  const sortedFilteredDays = [...filteredDays].sort((a, b) => 
    a.date.localeCompare(b.date)
  );

  // Calcula o saldo total (todos os meses)
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

  // Calcula o saldo total negativo (todos os meses)
  const totalNegativeOvertimeMinutes = days.reduce((sum, day) => {
    const { overtimeMinutes } = calculateOvertime(
      day.entrada1 || '09:00',
      day.saida1 || '12:00',
      day.entrada2 || '13:00',
      day.saida2 || '18:00',
      day.holiday
    );
    return overtimeMinutes < 0 ? sum + overtimeMinutes : sum;
  }, 0);

  // Calcula o saldo do mês selecionado
  const monthOvertimeMinutes = filteredDays.reduce((sum, day) => {
    const { overtimeMinutes } = calculateOvertime(
      day.entrada1 || '09:00',
      day.saida1 || '12:00',
      day.entrada2 || '13:00',
      day.saida2 || '18:00',
      day.holiday
    );
    return sum + overtimeMinutes;
  }, 0);

  // Calcula o saldo negativo do mês selecionado
  const monthNegativeOvertimeMinutes = filteredDays.reduce((sum, day) => {
    const { overtimeMinutes } = calculateOvertime(
      day.entrada1 || '09:00',
      day.saida1 || '12:00',
      day.entrada2 || '13:00',
      day.saida2 || '18:00',
      day.holiday
    );
    return overtimeMinutes < 0 ? sum + overtimeMinutes : sum;
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

  const dateCounts = days.reduce((acc, day) => {
    acc[day.date] = (acc[day.date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      p: 4,
      bgcolor: '#121212', 
      minHeight: '100vh',
      color: '#e0e0e0'
    }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3, color: '#ffffff' }}>
        Calculadora de Horas Extras
      </Typography>
      
      {/* Painel de informações */}
      <Paper 
        elevation={3} 
        sx={{ 
          width: '100%', 
          maxWidth: 900, 
          mb: 4, 
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#1e1e1e',
          border: '1px solid #333'
        }}
      >
        {/* Cabeçalho do painel */}
        <Box sx={{ 
          bgcolor: '#2c2c2c', 
          color: '#ffffff', 
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #333'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Painel de Controle
          </Typography>
          
          {/* Dropdown para seleção de mês */}
          <FormControl sx={{ minWidth: 220, bgcolor: '#121212', borderRadius: 1 }}>
            <InputLabel id="month-select-label" sx={{ color: '#9e9e9e' }}>Selecione o Mês</InputLabel>
            <Select
              labelId="month-select-label"
              id="month-select"
              value={selectedMonth}
              label="Selecione o Mês"
              onChange={(e) => setSelectedMonth(e.target.value)}
              size="small"
              sx={{ 
                color: '#ffffff',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: '#555'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#777'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2196F3'
                },
                '.MuiSvgIcon-root': {
                  color: '#9e9e9e'
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#1e1e1e',
                    color: '#e0e0e0',
                    border: '1px solid #333'
                  }
                }
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
        
        {/* Conteúdo do painel - mostra os saldos */}
        <Box sx={{ 
          p: 3, 
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}>
          {/* Parte superior - Saldo Total e Saldo do Mês */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3
          }}>
            {/* Saldo Total (Todos os Meses) */}
            <Box sx={{ 
              flex: 1, 
              p: 2, 
              border: '1px solid #333', 
              borderRadius: 2,
              bgcolor: '#252525'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#bbbbbb' }}>
                Saldo Total (Todos os Meses)
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1.5, 
                  borderRadius: 1,
                  bgcolor: 'rgba(33, 150, 243, 0.08)',
                  border: '1px solid rgba(33, 150, 243, 0.3)'
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#2196F3',
                    mr: 1.5
                  }}/>
                  <Typography sx={{ flex: 1, color: '#e0e0e0' }}>Saldo Total:</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#2196F3' }}>
                    {formatMinutesToHHMM(totalOvertimeMinutes)}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1.5, 
                  borderRadius: 1,
                  bgcolor: 'rgba(244, 67, 54, 0.08)',
                  border: '1px solid rgba(244, 67, 54, 0.3)'
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#f44336',
                    mr: 1.5
                  }}/>
                  <Typography sx={{ flex: 1, color: '#e0e0e0' }}>Horas Negativas:</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#f44336' }}>
                    {formatMinutesToHHMM(totalNegativeOvertimeMinutes)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            {/* Saldo do Mês Selecionado */}
            <Box sx={{ 
              flex: 1, 
              p: 2, 
              border: '1px solid #333', 
              borderRadius: 2,
              bgcolor: '#252525'
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#bbbbbb' }}>
                Saldo do Mês: {formatYearMonth(selectedMonth)}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1.5, 
                  borderRadius: 1,
                  bgcolor: 'rgba(76, 175, 80, 0.08)',
                  border: '1px solid rgba(76, 175, 80, 0.3)'
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#4CAF50',
                    mr: 1.5
                  }}/>
                  <Typography sx={{ flex: 1, color: '#e0e0e0' }}>Saldo do Mês:</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
                    {formatMinutesToHHMM(monthOvertimeMinutes)}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  p: 1.5, 
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 152, 0, 0.08)',
                  border: '1px solid rgba(255, 152, 0, 0.3)'
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    bgcolor: '#FF9800',
                    mr: 1.5
                  }}/>
                  <Typography sx={{ flex: 1, color: '#e0e0e0' }}>Horas Negativas do Mês:</Typography>
                  <Typography sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                    {formatMinutesToHHMM(monthNegativeOvertimeMinutes)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          
          {/* Gráfico de Pizza - Distribuição de Horas Extras por Mês */}
          <Box sx={{ 
            p: 2, 
            border: '1px solid #333', 
            borderRadius: 2,
            bgcolor: '#252525',
            width: '100%'
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: '#bbbbbb', textAlign: 'center' }}>
              Distribuição de Horas Extras por Mês
            </Typography>
            
            {calculateOvertimeByMonth().length > 0 ? (
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={calculateOvertimeByMonth()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                    {calculateOvertimeByMonth().map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(_, __, props: any) => [props.payload.formattedValue, 'Horas extras']}
                      contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', color: '#e0e0e0' }}
                    />

                    <Legend formatter={(value) => <span style={{ color: '#e0e0e0' }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 200,
                color: '#888',
                border: '1px dashed #555',
                borderRadius: 2,
                p: 2
              }}>
                <Typography>
                  Não há dados suficientes para gerar o gráfico. Adicione dias com horas extras positivas.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          mt: 2, 
          maxWidth: 900, 
          bgcolor: '#1e1e1e', 
          border: '1px solid #333',
          borderRadius: 2,
          boxShadow: '0 4px 6px rgba(0,0,0,0.4)'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#2c2c2c' }}>
              <TableCell align="center" sx={{ color: '#ffffff', borderBottom: '1px solid #333' }}>Data</TableCell>
              <TableCell align="center" sx={{ color: '#ffffff', borderBottom: '1px solid #333' }}>Feriado</TableCell>
              <TableCell align="center" sx={{ color: '#ffffff', borderBottom: '1px solid #333' }}>Entrada 1</TableCell>
              <TableCell align="center" sx={{ color: '#ffffff', borderBottom: '1px solid #333' }}>Saída 1</TableCell>
              <TableCell align="center" sx={{ color: '#ffffff', borderBottom: '1px solid #333' }}>Entrada 2</TableCell>
              <TableCell align="center" sx={{ color: '#ffffff', borderBottom: '1px solid #333' }}>Saída 2</TableCell>
              <TableCell align="center" sx={{ color: '#ffffff', borderBottom: '1px solid #333' }}>Saldo do Dia</TableCell>
              <TableCell align="center" sx={{ color: '#ffffff', borderBottom: '1px solid #333' }}>Remover</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFilteredDays.map(day => {
              const { overtimeMinutes } = calculateOvertime(
                day.entrada1 || '09:00',
                day.saida1 || '12:00',
                day.entrada2 || '13:00',
                day.saida2 || '18:00',
                day.holiday
              );
              return (
                <TableRow key={day.id} sx={{ 
                  '&:nth-of-type(odd)': { bgcolor: '#252525' },
                  '&:nth-of-type(even)': { bgcolor: '#1e1e1e' },
                  '&:hover': { bgcolor: '#303030' }
                }}>
                  <TableCell
                    align="center"
                    sx={{
                      color: '#e0e0e0',
                      borderBottom: '1px solid #333',
                      backgroundColor: dateCounts[day.date] > 1 ? 'rgba(224, 59, 75, 0.2)' : 'inherit'
                    }}
                  >
                    <TextField
                      type="date"
                      value={day.date}
                      onChange={e => updateDay(day.id, 'date', e.target.value)}
                      variant="standard"
                      sx={{
                        '& input': { color: '#e0e0e0' },
                        '& .MuiInput-underline:before': { borderBottomColor: '#555' },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#777' },
                        '& .MuiInput-underline:after': { borderBottomColor: '#2196F3' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: '1px solid #333' }}>
                    <Checkbox
                      checked={day.holiday}
                      onChange={e => updateDay(day.id, 'holiday', e.target.checked)}
                      sx={{
                        color: '#666',
                        '&.Mui-checked': { color: '#2196F3' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#e0e0e0', borderBottom: '1px solid #333' }}>
                    <TextField
                      type="time"
                      value={day.entrada1 === '' ? '09:00' : day.entrada1}
                      onChange={e => updateDay(day.id, 'entrada1', e.target.value)}
                      inputProps={{ step: 300 }}
                      variant="standard"
                      sx={{
                        '& input': { color: '#e0e0e0' },
                        '& .MuiInput-underline:before': { borderBottomColor: '#555' },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#777' },
                        '& .MuiInput-underline:after': { borderBottomColor: '#2196F3' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#e0e0e0', borderBottom: '1px solid #333' }}>
                    <TextField
                      type="time"
                      value={day.saida1 === '' ? '12:00' : day.saida1}
                      onChange={e => updateDay(day.id, 'saida1', e.target.value)}
                      inputProps={{ step: 300 }}
                      variant="standard"
                      sx={{
                        '& input': { color: '#e0e0e0' },
                        '& .MuiInput-underline:before': { borderBottomColor: '#555' },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#777' },
                        '& .MuiInput-underline:after': { borderBottomColor: '#2196F3' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#e0e0e0', borderBottom: '1px solid #333' }}>
                    <TextField
                      type="time"
                      value={day.entrada2 === '' ? '13:00' : day.entrada2}
                      onChange={e => updateDay(day.id, 'entrada2', e.target.value)}
                      inputProps={{ step: 300 }}
                      variant="standard"
                      sx={{
                        '& input': { color: '#e0e0e0' },
                        '& .MuiInput-underline:before': { borderBottomColor: '#555' },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#777' },
                        '& .MuiInput-underline:after': { borderBottomColor: '#2196F3' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#e0e0e0', borderBottom: '1px solid #333' }}>
                    <TextField
                      type="time"
                      value={day.saida2 === '' ? '18:00' : day.saida2}
                      onChange={e => updateDay(day.id, 'saida2', e.target.value)}
                      inputProps={{ step: 300 }}
                      variant="standard"
                      sx={{
                        '& input': { color: '#e0e0e0' },
                        '& .MuiInput-underline:before': { borderBottomColor: '#555' },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#777' },
                        '& .MuiInput-underline:after': { borderBottomColor: '#2196F3' }
                      }}
                    />
                  </TableCell>
                  <TableCell 
                    align="center" 
                    sx={{ 
                      color: overtimeMinutes >= 0 ? '#4CAF50' : '#f44336', 
                      fontWeight: 'bold',
                      borderBottom: '1px solid #333'
                    }}
                  >
                    {formatMinutesToHHMM(overtimeMinutes)}
                  </TableCell>
                  <TableCell align="center" sx={{ borderBottom: '1px solid #333' }}>
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
      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mt: 3,
        justifyContent: 'center',
        bgcolor: '#252525',
        p: 2,
        borderRadius: 2,
        border: '1px solid #333',
        maxWidth: 900,
        width: '100%'
      }}>
        <Tooltip title="Exportar dados">
          <IconButton 
            onClick={handleExport} 
            sx={{ 
              color: '#2196F3',
              bgcolor: '#1a1a1a',
              '&:hover': {
                bgcolor: '#333'
              },
              p: 1.5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            <DownloadIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Importar dados">
          <IconButton 
            onClick={handleImportClick} 
            sx={{ 
              color: '#2196F3',
              bgcolor: '#1a1a1a',
              '&:hover': {
                bgcolor: '#333'
              },
              p: 1.5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}
          >
            <UploadIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Adicionar dia">
          <IconButton 
            onClick={addDay} 
            sx={{ 
              color: '#4CAF50',
              bgcolor: '#1a1a1a',
              '&:hover': {
                bgcolor: '#333'
              },
              p: 1.5,
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
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
        style={{ display: 'none' }}
      />
    </Box>
  );
}

export default App;