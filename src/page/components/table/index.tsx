import React from 'react';
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Checkbox,
  Tooltip,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { calculateOvertime, formatMinutesToHHMM } from '../../utils';
import type {OvertimeTableProps } from './types';
import { Day } from '../../types';
const OvertimeTable: React.FC<OvertimeTableProps> = ({ days, updateDay, removeDay }) => {
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
        maxWidth: 900,
        bgcolor: '#1e1e1e',
        border: '1px solid #333',
        borderRadius: 2,
        boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: '#2c2c2c' }}>
            {[
              'Data',
              'Feriado',
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
                sx={{ color: '#ffffff', borderBottom: '1px solid #333' }}
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
              day.holiday
            );

            return (
              <TableRow
                key={day.id}
                sx={{
                  '&:nth-of-type(odd)': { bgcolor: '#252525' },
                  '&:nth-of-type(even)': { bgcolor: '#1e1e1e' },
                  '&:hover': { bgcolor: '#303030' },
                }}
              >
                <TableCell
                  align="center"
                  sx={{
                    color: '#e0e0e0',
                    borderBottom: '1px solid #333',
                    backgroundColor:
                      dateCounts[day.date] > 1
                        ? 'rgba(224, 59, 75, 0.2)'
                        : 'inherit',
                  }}
                >
                  <TextField
                    type="date"
                    value={day.date}
                    onChange={(e) => updateDay(day.id, 'date', e.target.value)}
                    variant="standard"
                    sx={{
                      '& input': { color: '#e0e0e0' },
                      '& .MuiInput-underline:before': { borderBottomColor: '#555' },
                      '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#777' },
                      '& .MuiInput-underline:after': { borderBottomColor: '#2196F3' },
                    }}
                  />
                </TableCell>

                <TableCell align="center" sx={{ borderBottom: '1px solid #333' }}>
                  <Checkbox
                    checked={day.holiday}
                    onChange={(e) => updateDay(day.id, 'holiday', e.target.checked)}
                    sx={{ color: '#666', '&.Mui-checked': { color: '#2196F3' } }}
                  />
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
                      sx={{
                        '& input': { color: '#e0e0e0' },
                        '& .MuiInput-underline:before': { borderBottomColor: '#555' },
                        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#777' },
                        '& .MuiInput-underline:after': { borderBottomColor: '#2196F3' },
                      }}
                    />
                  </TableCell>
                ))}

                <TableCell
                  align="center"
                  sx={{
                    color: overtimeMinutes >= 0 ? '#4CAF50' : '#f44336',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #333',
                  }}
                >
                  {formatMinutesToHHMM(overtimeMinutes)}
                </TableCell>

                <TableCell align="center" sx={{ borderBottom: '1px solid #333' }}>
                  <Tooltip title="Remover dia">
                    <IconButton
                      onClick={() => removeDay(day.id)}
                      sx={{ color: '#2196F3' }}
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
  );
};

export default OvertimeTable;