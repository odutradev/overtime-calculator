import { Box, Typography, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

import { formatMinutesToHHMM, formatYearMonth } from '../../utils';

import type { OvertimeSummaryProps } from './types';

const Summary = ({ totalOvertimeMinutes, totalNegativeOvertimeMinutes, monthOvertimeMinutes, monthNegativeOvertimeMinutes, selectedMonth }: OvertimeSummaryProps) => {
  const panels = [
    {
      title: 'Saldo Total (Todos os Meses)',
      stats: [
        {
          label: 'Saldo Total:',
          value: formatMinutesToHHMM(totalOvertimeMinutes),
          color: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.08)',
          borderColor: 'rgba(33, 150, 243, 0.3)',
          tooltip: 'Soma de todas as horas extras (positivas e negativas) de todos os meses registrados. Este é o seu saldo acumulado total.'
        },
        {
          label: 'Horas Negativas:',
          value: formatMinutesToHHMM(totalNegativeOvertimeMinutes),
          color: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.08)',
          borderColor: 'rgba(244, 67, 54, 0.3)',
          tooltip: 'Soma apenas das horas negativas (déficit) de todos os meses. Representa o tempo que você trabalhou a menos que as 8 horas diárias.'
        },
      ],
    },
    {
      title: `Saldo do Mês: ${formatYearMonth(selectedMonth)}`,
      stats: [
        {
          label: 'Saldo do Mês:',
          value: formatMinutesToHHMM(monthOvertimeMinutes),
          color: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.08)',
          borderColor: 'rgba(76, 175, 80, 0.3)',
          tooltip: 'Soma de todas as horas extras (positivas e negativas) do mês selecionado. Mostra o saldo mensal atual.'
        },
        {
          label: 'Horas Negativas do Mês:',
          value: formatMinutesToHHMM(monthNegativeOvertimeMinutes),
          color: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.08)',
          borderColor: 'rgba(255, 152, 0, 0.3)',
          tooltip: 'Soma apenas das horas negativas do mês selecionado. Representa os dias em que você trabalhou menos que 8 horas neste mês.'
        },
      ],
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 3,
      }}
    >
      {panels.map((panel, idx) => (
        <Box
          key={idx}
          sx={{
            flex: 1,
            p: 2,
            border: '1px solid #333',
            borderRadius: 2,
            bgcolor: '#252525',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 'bold', mb: 2, color: '#bbbbbb' }}
          >
            {panel.title}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {panel.stats.map((stat, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: stat.backgroundColor,
                  border: `1px solid ${stat.borderColor}`,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: stat.color,
                    mr: 1.5,
                  }}
                />
                <Typography sx={{ flex: 1, color: '#e0e0e0' }}>
                  {stat.label}
                </Typography>
                <Typography sx={{ fontWeight: 'bold', color: stat.color, mr: 1 }}>
                  {stat.value}
                </Typography>
                <Tooltip 
                  title={stat.tooltip}
                  placement="top"
                  arrow
                  sx={{
                    '& .MuiTooltip-tooltip': {
                      bgcolor: '#1e1e1e',
                      color: '#e0e0e0',
                      border: '1px solid #333',
                      fontSize: '0.875rem',
                      maxWidth: 300,
                    },
                    '& .MuiTooltip-arrow': {
                      color: '#1e1e1e',
                    },
                  }}
                >
                  <InfoIcon 
                    sx={{ 
                      color: '#666', 
                      fontSize: '1rem',
                      cursor: 'help',
                      '&:hover': {
                        color: '#999',
                      }
                    }} 
                  />
                </Tooltip>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Summary;