export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export const calculateOvertime = (
  entrada1: string,
  saida1: string,
  entrada2: string,
  saida2: string,
  holiday: boolean,
  ignored: boolean = false,
  toleranceEnabled: boolean = false,
  didNotWork: boolean = false
): { overtimeMinutes: number } => {
  if (ignored) return { overtimeMinutes: 0 };
  
  if (didNotWork) return { overtimeMinutes: -480 };
  
  const period1 = timeToMinutes(saida1) - timeToMinutes(entrada1);
  const period2 = timeToMinutes(saida2) - timeToMinutes(entrada2);
  const totalMinutes = period1 + period2;
  if (holiday) return { overtimeMinutes: totalMinutes };
  const standardMinutes = 8 * 60;
  const overtimeMinutes = totalMinutes - standardMinutes;
  
  if (toleranceEnabled && Math.abs(overtimeMinutes) < 10) {
    return { overtimeMinutes: 0 };
  }
  
  return { overtimeMinutes };
};

export const formatMinutesToHHMM = (mins: number): string => {
  const sign = mins < 0 ? "-" : "";
  const absMins = Math.abs(mins);
  const hours = Math.floor(absMins / 60);
  const minutes = absMins % 60;
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

export const getYearMonth = (dateStr: string): string => {
  if (!dateStr) return "";
  return dateStr.substring(0, 7);
};

export const formatYearMonth = (yearMonth: string): string => {
  if (!yearMonth) return "";
  const [year, month] = yearMonth.split("-");
  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${monthNames[parseInt(month) - 1]} de ${year}`;
};

export const exportToPDF = (
  days: any[],
  selectedMonth: string,
  toleranceEnabled: boolean
) => {
  const doc = new (window as any).jspdf.jsPDF();
  
  const filteredDays = days.filter(day => getYearMonth(day.date) === selectedMonth);
  const sortedDays = [...filteredDays].sort((a, b) => a.date.localeCompare(b.date));
  
  let positiveTotal = 0;
  let negativeTotal = 0;
  let totalBalance = 0;
  
  doc.setFontSize(16);
  doc.text(`Relatório de Horas - ${formatYearMonth(selectedMonth)}`, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Tolerância de 10 minutos: ${toleranceEnabled ? 'Ativada' : 'Desativada'}`, 20, 35);
  
  const headers = [
    'Data',
    'Feriado',
    'Não Trabalhei',
    'Ignorar',
    'Entrada 1',
    'Saída 1',
    'Entrada 2',
    'Saída 2',
    'Saldo'
  ];
  
  const tableData = sortedDays.map(day => {
    const { overtimeMinutes } = calculateOvertime(
      day.entrada1 || '09:00',
      day.saida1 || '12:00',
      day.entrada2 || '13:00',
      day.saida2 || '18:00',
      day.holiday,
      day.ignored,
      toleranceEnabled,
      day.didNotWork
    );
    
    if (!day.ignored) {
      totalBalance += overtimeMinutes;
      if (overtimeMinutes > 0) {
        positiveTotal += overtimeMinutes;
      } else if (overtimeMinutes < 0) {
        negativeTotal += overtimeMinutes;
      }
    }
    
    const formatDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    };
    
    return [
      formatDate(day.date),
      day.holiday ? 'Sim' : 'Não',
      day.didNotWork ? 'Sim' : 'Não',
      day.ignored ? 'Sim' : 'Não',
      day.entrada1 || '09:00',
      day.saida1 || '12:00',
      day.entrada2 || '13:00',
      day.saida2 || '18:00',
      day.ignored ? '---' : formatMinutesToHHMM(overtimeMinutes)
    ];
  });
  
  let startY = 50;
  
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: startY,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [44, 44, 44],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    bodyStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0]
    },
    alternateRowStyles: {
      fillColor: [230, 230, 230]
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 15 },
      2: { cellWidth: 20 },
      3: { cellWidth: 15 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 18 },
      7: { cellWidth: 18 },
      8: { cellWidth: 20, halign: 'center' }
    },
    didParseCell: function(data: any) {
      if (data.column.index === 8 && data.section === 'body') {
        const cellValue = data.cell.text[0];
        if (cellValue !== '---') {
          const isNegative = cellValue.startsWith('-');
          const isPositive = !isNegative && cellValue !== '00:00';
          
          if (isNegative) {
            data.cell.styles.textColor = [220, 53, 69];
          } else if (isPositive) {
            data.cell.styles.textColor = [40, 167, 69];
          }
        }
      }
    }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Resumo do Mês:', 20, finalY);
  
  doc.setFont(undefined, 'normal');
  doc.setTextColor(40, 167, 69);
  doc.text(`Saldo Positivo: ${formatMinutesToHHMM(positiveTotal)}`, 20, finalY + 15);
  
  doc.setTextColor(220, 53, 69);
  doc.text(`Saldo Negativo: ${formatMinutesToHHMM(negativeTotal)}`, 20, finalY + 25);
  
  doc.setTextColor(33, 150, 243);
  doc.text(`Saldo Total: ${formatMinutesToHHMM(totalBalance)}`, 20, finalY + 35);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, finalY + 50);
  
  const fileName = `relatorio_horas_${selectedMonth.replace('-', '_')}.pdf`;
  doc.save(fileName);
};

export const exportGeneralMetricsToPDF = (
  days: any[],
  toleranceEnabled: boolean
) => {
  const doc = new (window as any).jspdf.jsPDF();
  
  const monthlyData: Record<string, { positive: number; negative: number; total: number }> = {};
  
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
    
    if (!monthlyData[yearMonth]) {
      monthlyData[yearMonth] = { positive: 0, negative: 0, total: 0 };
    }
    
    monthlyData[yearMonth].total += overtimeMinutes;
    
    if (overtimeMinutes > 0) {
      monthlyData[yearMonth].positive += overtimeMinutes;
    } else if (overtimeMinutes < 0) {
      monthlyData[yearMonth].negative += overtimeMinutes;
    }
  });
  
  const sortedMonths = Object.keys(monthlyData).sort();
  
  let totalPositive = 0;
  let totalNegative = 0;
  let totalGeneral = 0;
  
  Object.values(monthlyData).forEach(month => {
    totalPositive += month.positive;
    totalNegative += month.negative;
    totalGeneral += month.total;
  });
  
  doc.setFontSize(18);
  doc.text('Relatório Geral de Métricas', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Tolerância de 10 minutos: ${toleranceEnabled ? 'Ativada' : 'Desativada'}`, 20, 35);
  doc.text(`Período: ${sortedMonths.length > 0 ? `${formatYearMonth(sortedMonths[0])} até ${formatYearMonth(sortedMonths[sortedMonths.length - 1])}` : 'Nenhum dado'}`, 20, 45);
  
  const headers = [
    'Mês',
    'Saldo Positivo',
    'Saldo Negativo', 
    'Saldo Total'
  ];
  
  const tableData = sortedMonths.map(month => [
    formatYearMonth(month),
    formatMinutesToHHMM(monthlyData[month].positive),
    formatMinutesToHHMM(monthlyData[month].negative),
    formatMinutesToHHMM(monthlyData[month].total)
  ]);
  
  doc.autoTable({
    head: [headers],
    body: tableData,
    startY: 60,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [44, 44, 44],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    bodyStyles: {
      fillColor: [245, 245, 245],
      textColor: [0, 0, 0]
    },
    alternateRowStyles: {
      fillColor: [230, 230, 230]
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center' },
      3: { cellWidth: 40, halign: 'center' }
    },
    didParseCell: function(data: any) {
      if (data.section === 'body') {
        if (data.column.index === 1) {
          data.cell.styles.textColor = [40, 167, 69];
        } else if (data.column.index === 2) {
          data.cell.styles.textColor = [220, 53, 69];
        } else if (data.column.index === 3) {
          const cellValue = data.cell.text[0];
          if (cellValue.startsWith('-')) {
            data.cell.styles.textColor = [220, 53, 69];
          } else if (cellValue !== '00:00') {
            data.cell.styles.textColor = [40, 167, 69];
          } else {
            data.cell.styles.textColor = [0, 0, 0];
          }
        }
      }
    }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY + 25;
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Resumo Geral:', 20, finalY);
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  doc.setTextColor(40, 167, 69);
  doc.text(`Total de Horas Positivas: ${formatMinutesToHHMM(totalPositive)}`, 20, finalY + 20);
  
  doc.setTextColor(220, 53, 69);
  doc.text(`Total de Horas Negativas: ${formatMinutesToHHMM(totalNegative)}`, 20, finalY + 35);
  
  doc.setTextColor(33, 150, 243);
  doc.text(`Saldo Geral: ${formatMinutesToHHMM(totalGeneral)}`, 20, finalY + 50);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Total de meses registrados: ${sortedMonths.length}`, 20, finalY + 70);
  
  doc.setFontSize(8);
  doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 20, finalY + 85);
  
  const fileName = `relatorio_geral_metricas_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.pdf`;
  doc.save(fileName);
};