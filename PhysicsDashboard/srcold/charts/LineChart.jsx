import React, { useRef, useEffect } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { Chart, LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip } from 'chart.js';
import 'chartjs-adapter-moment';

// Import utilities
import { chartColors } from './ChartjsConfig';
import { formatValue } from '../utils/Utils';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip);

function LineChart({ data, width, height }) {
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor, chartAreaBg } = chartColors;

  useEffect(() => {
    const ctx = canvas.current.getContext('2d');
    const chartInstance = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        chartArea: {
          backgroundColor: darkMode ? chartAreaBg.dark : chartAreaBg.light,
        },
        layout: {
          padding: 20,
        },
        scales: {
          y: {
            display: true,
            beginAtZero: false,
          },
          x: {
            type: 'time',
            time: {
              parser: 'MM-DD-YYYY',
              unit: 'month',
            },
            display: true,
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: () => false, // Disable tooltip title
              label: (context) => {
                if (context.datasetIndex === 0) {
                  return `Temperature: ${formatValue(context.parsed.y)} °C`; // Temperature with °C unit
                } else if (context.datasetIndex === 1) {
                  return `Humidity: ${formatValue(context.parsed.y)} %`; // Humidity with % unit
                }
                return '';
              },
              bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
              backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
              borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
            },
          },
          legend: {
            display: true,
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
    });

    return () => chartInstance.destroy();
  }, [data, currentTheme]);

  return <canvas ref={canvas} width={width} height={height*2}></canvas>;
}

export default LineChart;
