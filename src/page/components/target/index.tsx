import { Paper, Box, Typography, TextField } from '@mui/material';

import { formatMinutesToHHMM } from '../../utils';

import type { OvertimeTargetProps } from './types';

const Target= ({ targetHours, onChange, totalOvertimeMinutes, onOpenModal }: OvertimeTargetProps) => {
    const targetMinutes = typeof targetHours === 'number' ? targetHours * 60 : 0;
    const statusText = targetHours !== '' ? targetMinutes <= totalOvertimeMinutes ? 'Meta Atingida' : `Faltam: ${formatMinutesToHHMM(targetMinutes - totalOvertimeMinutes)}`: 'Meta não definida';

  return (
    <Paper
      sx={{
        width: '100%',
        maxWidth: 900,
        mb: 4,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: '#1e1e1e',
        border: '1px solid #333',
        p: 2,
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 'bold', mb: 2, color: '#ffffff' }}
      >
        Meta de Horas
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          label="Meta (horas)"
          type="number"
          value={targetHours}
          onChange={(e) =>
            onChange(e.target.value === '' ? '' : Number(e.target.value))
          }
          variant="standard"
          InputLabelProps={{ shrink: true }}
          sx={{
            '& input': { color: '#e0e0e0' },
            '& .MuiInput-underline:before': { borderBottomColor: '#555' },
            '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
              borderBottomColor: '#777',
            },
            '& .MuiInput-underline:after': { borderBottomColor: '#2196F3' },
            flex: 1,
          }}
        />
        <Box
          onClick={onOpenModal}
          sx={{
            cursor: 'pointer',
            p: 2,
            border: '1px solid #333',
            borderRadius: 2,
            bgcolor: '#252525',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ color: '#e0e0e0', fontWeight: 'bold' }}>
            Meta: {targetHours !== '' ? `${targetHours} horas` : '---'}
          </Typography>
          <Typography sx={{ color: '#e0e0e0', fontWeight: 'bold' }}>
            {statusText}
          </Typography>
          <Typography sx={{ color: '#2196F3' }}>
            Clique para ver previsões
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default Target;