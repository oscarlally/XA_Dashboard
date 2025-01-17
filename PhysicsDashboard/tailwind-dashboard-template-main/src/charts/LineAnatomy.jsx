import React, { useRef, useEffect } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { Chart, LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip } from 'chart.js';
import 'chartjs-adapter-moment';
import { chartColors } from './ChartjsConfig';
import { formatValue } from '../utils/Utils';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip);

function LineAnatomy({ data, width, height }) {
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
            ticks: {
              callback: (value) => `${value} mins`, // Add "mins" to y-axis labels
            },
          },
          x: {
            type: 'time',
            time: {
              parser: 'YYYY-MM-DD', // Ensure this matches your date format
              unit: 'day', // Use 'day' if your data is daily
              tooltipFormat: 'll', // Format for tooltip (optional)
            },
            display: true,
            title: {
              display: true,
              text: 'Date',
            },
            ticks: {
              source: 'data', // Ensures ticks are generated based on your data points
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: () => false, // Disable tooltip title
              label: (context) => {
                if (context.datasetIndex === 0) {
                  return `Scan Length: ${formatValue(context.parsed.y)} mins`; //
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

  return <canvas ref={canvas} width={width} height={height * 2}></canvas>;
}

export default LineAnatomy;
