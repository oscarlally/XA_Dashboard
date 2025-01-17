import React, { useRef, useEffect } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { Chart, LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip } from 'chart.js';
import 'chartjs-adapter-moment';

// Import utilities
import { chartColors } from './ChartjsConfig';
import { formatValue } from '../utils/Utils';

Chart.register(LineController, LineElement, Filler, PointElement, LinearScale, TimeScale, Tooltip);

function LineChartEmail({ data, width, height }) {
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
            beginAtZero: true,
            ticks: {
              precision: 0, // Set precision to 0 for integer values
            },
          },
          x: {
            type: 'time',
            time: {
              parser: 'MM-DD-YYYY',
              unit: 'month',
            },
            display: true, // Make sure the x-axis is displayed
            ticks: {
              callback: (value, index, values) => {
                return `Day ${index + 1}`; // Custom label for x-axis, adjust as needed
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: () => false, // Disable tooltip title
              label: (context) => {
                return `No Safety Requests: ${formatValue(context.parsed.y)}`; // Adjust the label according to your dataset
              },
              bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
              backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
              borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
            },
          },
          legend: {
            display: false, // No need for legend when there's only one dataset
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

  return <canvas ref={canvas} width={width} height={height}></canvas>;
}

export default LineChartEmail;
