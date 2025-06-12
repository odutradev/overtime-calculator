import { TableContainer, Paper, Table as CustomTable, TableHead, TableRow, TableCell, TableBody, TextField, Checkbox, Tooltip, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EventBusyIcon from '@mui/icons-material/EventBusy';

import { calculateOvertime, formatMinutesToHHMM } from '../../utils';

import type { OvertimeTableProps } from './types';
import type { Day } from '../../types';

const Table = ({ days, updateDay, removeDay }: OvertimeTableProps) => {
  const dateCounts = days.reduce((acc, day) => {
    acc[day.date] = (acc[day.date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <TableContainer
      component={Paper}
      sx={{
        mt: 2,
        maxWidth: 1000,
        bgcolor: '#1e1e1e',
        border: '1px solid #333',
        borderRadius: 2,
        boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
      }}
    >
      <CustomTable>
        <TableHead>
          <TableRow sx={{ bgcolor: '#2c2c2c' }}>
            {[
              'Data',
              'Feriado',
              'Ignorar',
              'Entrada 1',
              'Saída 1',
              'Entrada 2',
              'Saída 2',
              'Saldo do Dia',
              'Remover',
            ].map((header) => (
              <TableCell
                key={header}
                align="center"
                sx={{ color: '#ffffff', borderBottom: '1px solid #333', fontWeight: 'bold' }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedDays.map((day) => {
            const { overtimeMinutes } = calculateOvertime(
              day.entrada1 || '09:00',
              day.saida1 || '12:00',
              day.entrada2 || '13:00',
              day.saida2 || '18:00',
              day.holiday,
              day.ignored,
              false
            );

            const isIgnored = day.ignored;
            const isDuplicated = dateCounts[day.date] > 1;

            return (
              <TableRow
                key={day.id}
                sx={{
                  '&:nth-of-type(odd)': { bgcolor: '#252525' },
                  '&:nth-of-type(even)': { bgcolor: '#1e1e1e' },
                  '&:hover': { 
                    bgcolor: '#303030',
                    transition: 'all 0.2s ease-in-out',
                    boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
                    zIndex: 1,
                    position: 'relative',
                    '& .MuiTableCell-root': {
                      borderColor: 'rgba(33, 150, 243, 0.5)',
                    }
                  },
                  opacity: isIgnored ? 0.5 : 1,
                  filter: isIgnored ? 'grayscale(0.7)' : 'none',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <TableCell
                  align="center"
                  sx={{
                    color: '#e0e0e0',
                    borderBottom: '1px solid #333',
                    backgroundColor: isDuplicated ? 'rgba(224, 59, 75, 0.2)' : 'inherit',
                    position: 'relative',
                  }}
                >
                  <TextField
                    type="date"
                    value={day.date}
                    onChange={(e) => updateDay(day.id, 'date', e.target.value)}
                    variant="standard"
                    disabled={isIgnored}
                    sx={{
                      '& input': { color: '#e0e0e0' },
                      '& .MuiInput-underline:before': { borderBottomColor: '#555' },
                      '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#777' },
                      '& .MuiInput-underline:after': { borderBottomColor: '#2196F3' },
                    }}
                  />
                  {isDuplicated && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: '#f44336',
                        boxShadow: '0 0 4px rgba(244, 67, 54, 0.8)',
                      }}
                    />
                  )}
                </TableCell>

                <TableCell align="center" sx={{ borderBottom: '1px solid #333' }}>
                  <Tooltip title={day.holiday ? "Dia é feriado" : "Marcar como feriado"}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Checkbox
                        checked={day.holiday}
                        onChange={(e) => updateDay(day.id, 'holiday', e.target.checked)}
                        disabled={isIgnored}
                        icon={<EventBusyIcon />}
                        checkedIcon={<EventBusyIcon />}
                        sx={{ 
                          color: '#666', 
                          '&.Mui-checked': { color: '#FF9800' },
                          '&:hover': { bgcolor: 'rgba(255, 152, 0, 0.1)' }
                        }}
                      />
                    </Box>
                  </Tooltip>
                </TableCell>

                <TableCell align="center" sx={{ borderBottom: '1px solid #333' }}>
                  <Tooltip title={day.ignored ? "Dia está sendo ignorado" : "Ignorar este dia no cálculo"}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Checkbox
                        checked={day.ignored}
                        onChange={(e) => updateDay(day.id, 'ignored', e.target.checked)}
                        icon={<VisibilityOffIcon />}
                        checkedIcon={<VisibilityOffIcon />}
                        sx={{ 
                          color: '#666', 
                          '&.Mui-checked': { color: '#f44336' },
                          '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' }
                        }}
                      />
                    </Box>
                  </Tooltip>
                </TableCell>

                {['entrada1', 'saida1', 'entrada2', 'saida2'].map((field) => (
                  <TableCell
                    key={field}
                    align="center"
                    sx={{ color: '#e0e0e0', borderBottom: '1px solid #333' }}
                  >
                    <TextField
                      type="time"
                      value={(day as any)[field] || (field.includes('entrada') ? '09:00' : '12:00')}
                      onChange={(e) =>
                        updateDay(
                          day.id,
                          field as keyof Day,
                          e.target.value as any
                        )
                      }
                      inputProps={{ step: 300 }}
                      variant="standard"
                      disabled={isIgnored}
                      sx={{
                        '& input': { color: '#e0e0e0' },
                        '& .MuiInput-underline:before': { borderBottomColor: '#555' },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#777' },
                        '& .MuiInput-underline:after': { borderBottomColor: '#2196F3' },
                      }}
                    />
                  </TableCell>
                ))}

                <TableCell align="center" sx={{ borderBottom: '1px solid #333' }}>
                  <Tooltip 
                    title={
                      isIgnored 
                        ? "Dia ignorado - não conta no cálculo"
                        : Math.abs(overtimeMinutes) < 10
                          ? "Dentro da tolerância (±10min) - pode ser ignorado quando ativada"
                          : overtimeMinutes === 0
                            ? "Jornada cumprida exatamente - 8 horas trabalhadas"
                            : overtimeMinutes > 0
                              ? "Horas extras - tempo trabalhado além das 8 horas"
                              : "Déficit de horas - tempo trabalhado abaixo das 8 horas"
                    }
                  >
                    <Box
                      sx={{
                        color: isIgnored 
                          ? '#666' 
                          : Math.abs(overtimeMinutes) < 10 
                            ? '#FFD700' 
                            : overtimeMinutes >= 0 
                              ? '#4CAF50' 
                              : '#f44336',
                        fontWeight: 'bold',
                        position: 'relative',
                        cursor: 'help',
                        display: 'inline-block',
                      }}
                    >
                      {isIgnored ? '---' : formatMinutesToHHMM(overtimeMinutes)}
                      {isIgnored && (
                        <VisibilityOffIcon 
                          sx={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)',
                            opacity: 0.3,
                            fontSize: '1.2rem'
                          }} 
                        />
                      )}
                    </Box>
                  </Tooltip>
                </TableCell>

                <TableCell align="center" sx={{ borderBottom: '1px solid #333' }}>
                  <Tooltip title="Remover dia">
                    <IconButton
                      onClick={() => removeDay(day.id)}
                      sx={{ 
                        color: '#2196F3',
                        '&:hover': { 
                          bgcolor: 'rgba(33, 150, 243, 0.1)',
                          transform: 'scale(1.1)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </CustomTable>
    </TableContainer>
  );
};

export default Table;