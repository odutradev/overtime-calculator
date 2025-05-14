import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

import type { OvertimeForecastProps } from './types';

  const defaultAlternatives = [
    { label: "2 horas por dia", minutes: 120 },
    { label: "1:30 por dia", minutes: 90 },
    { label: "1 hora por dia", minutes: 60 },
    { label: "30 minutos por dia", minutes: 30 },
  ];

const Forecast: React.FC<OvertimeForecastProps> = ({ open, onClose, targetHours, missingMinutes, alternatives = defaultAlternatives }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Previsão para atingir a meta</DialogTitle>
    <DialogContent>
      {targetHours !== '' ? (
        missingMinutes > 0 ? (
          alternatives.map((option, index) => (
            <Typography key={index} sx={{ mb: 1 }}>
              {option.label}: {Math.ceil(missingMinutes / option.minutes)} dia(s)
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
      <Button onClick={onClose} sx={{ color: '#2196F3' }}>
        Fechar
      </Button>
    </DialogActions>
  </Dialog>
);

export default Forecast;