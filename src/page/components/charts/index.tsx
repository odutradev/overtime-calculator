import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Box, Typography } from '@mui/material';

import { defaultColors } from './defaultValues';

import type { OvertimeChartProps } from './types';

const Charts = ({ data, colors = defaultColors, width = '100%', height = 300 }: OvertimeChartProps) => {
  return (
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
      <Box sx={{ width, height }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                formatter={(_value, _name, props: any) => [
                  props.payload?.formattedValue || props.value,
                  "Horas extras",
                ]}
                contentStyle={{
                  backgroundColor: "#262626",
                  borderColor: "#333",
                }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#e0e0e0" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 200,
              color: "#888",
              border: "1px dashed #555",
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography>
              Não há dados suficientes para gerar o gráfico. Adicione dias com
              horas extras positivas.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Charts;
