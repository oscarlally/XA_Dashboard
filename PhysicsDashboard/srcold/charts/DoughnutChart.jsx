import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-moment';
import { chartColors } from './ChartjsConfig';
import { tailwindConfig } from '../utils/Utils';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

function DoughnutChart({ data, centerNumber, response, width, height }) {
  const canvasRef = useRef(null);
  const [chart, setChart] = useState(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { tooltipTitleColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const ctx = canvasRef.current.getContext('2d');

    const newChart = new Chart(ctx, {
      type: 'doughnut',
      data: data,
      options: {
        layout: {
          padding: {
            top: 20, // Adjust top padding to create space for the center number
            bottom: 20,
          },
        },
        plugins: {
          tooltip: {
            titleColor: darkMode ? tooltipTitleColor.dark : tooltipTitleColor.light,
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
          legend: {
            position: 'bottom', // Position the legend at the bottom
            align: 'center', // Align legend items to the center
          },
        },
        animation: {
          duration: 500,
        },
        maintainAspectRatio: false,
        resizeDelay: 200,
        cutout: '80%', // Adjust the thickness of the doughnut chart
      },
      plugins: [{
        id: 'centerNumberPlugin',
        afterDraw: (chart) => {
          const ctx = chart.ctx;
          const width = chart.width;
          const height = chart.height;

          // Using Tailwind CSS font utilities
          ctx.font = 'text-xl font-medium'; // Change the font size and weight as needed
          ctx.fillStyle = darkMode ? 'white' : 'black';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          if(response){
            ctx.fillText(centerNumber, width / 2,  3 * height / 7);
          }
          else {
            ctx.fillText(centerNumber, width / 2, 2 * height / 5);
          }
        },
      }],
    });

    setChart(newChart);

    return () => {
      newChart.destroy();
    };
  }, [data, centerNumber, currentTheme]);

  return (
    <div className="grow flex flex-col justify-center">
      <div>
        <canvas ref={canvasRef} width={width} height={height}></canvas>
      </div>
    </div>
  );
}

export default DoughnutChart;
