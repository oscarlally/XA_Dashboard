import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import {
  Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend,
} from 'chart.js';
import 'chartjs-adapter-moment';

// Import utilities
import { tailwindConfig, formatValue } from '../utils/Utils';
import { chartColors } from './ChartjsConfig';

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

function BarChart({
  data,
  width,
  height
}) {
  const [chart, setChart] = useState(null);
  const canvas = useRef(null);
  const legend = useRef(null);
  const { currentTheme } = useThemeProvider();
  const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  useEffect(() => {

    const ctx = canvas.current;
    const newChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        layout: {
          padding: {
            top: 12,
            bottom: 16,
            left: 20,
            right: 20,
          },
        },
        scales: {
          y: {
            border: {
              display: false,
            },
            ticks: {
              maxTicksLimit: 5,
              callback: (value) => `${value} W/Kg`,
              color: textColor[currentTheme],
            },
            grid: {
              color: gridColor[currentTheme],
            },
          },
          x: {
            type: 'category',
            border: {
              display: false,
            },
            grid: {
              display: false,
            },
            ticks: {
              color: textColor[currentTheme],
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: () => false, // Disable tooltip title
              label: (context) => `${formatValue(context.parsed.y)} W/Kg`,
            },
            bodyColor: tooltipBodyColor[currentTheme],
            backgroundColor: tooltipBgColor[currentTheme],
            borderColor: tooltipBorderColor[currentTheme],
          },
        },
        interaction: {
          intersect: false,
          mode: 'nearest',
        },
        animation: {
          duration: 500,
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
      },
      plugins: [
        {
          id: 'htmlLegend',
          afterUpdate(c, args, options) {
            const ul = legend.current;
            if (!ul) return;
            // Remove old legend items
            while (ul.firstChild) {
              ul.firstChild.remove();
            }
            // Reuse the built-in legendItems generator
            const items = c.options.plugins.legend.labels.generateLabels(c);
            items.forEach((item) => {
            });
          },
        },
      ],
    });

    setChart(newChart);
    return () => {
      newChart.destroy();
    };
  }, [data, currentTheme]);

  return (
    <React.Fragment>
      <div className="px-5 py-3">
        <ul ref={legend} className="flex flex-wrap"></ul>
      </div>
      <div className="grow">
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
    </React.Fragment>
  );
}

export default BarChart;
