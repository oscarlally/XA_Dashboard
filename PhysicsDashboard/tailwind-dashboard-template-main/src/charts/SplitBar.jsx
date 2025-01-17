import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-moment';
import { tailwindConfig, formatValue } from '../utils/Utils';
import { chartColors } from './ChartjsConfig';

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

function SplitBar({ data, width, height, title }) {
  const [chart, setChart] = useState(null);
  const canvas = useRef(null);
  const { currentTheme } = useThemeProvider();
  const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  useEffect(() => {
    const ctx = canvas.current;

    const config = {
      type: 'bar',
      data: data,
      options: {
        indexAxis: 'y', // Horizontal bars
        elements: {
          bar: {
            borderWidth: 2, // Border width of each bar
          }
        },
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: !!title, // Only show title if provided
            text: title || '', // Use the passed title or empty string
          },
          tooltip: {
            callbacks: {
              title: () => false, // Disable tooltip title
              label: (context) => `${formatValue(context.parsed.x)} mins`, // Use x value for label
            },
            bodyColor: tooltipBodyColor[currentTheme],
            backgroundColor: tooltipBgColor[currentTheme],
            borderColor: tooltipBorderColor[currentTheme],
          },
        },
        scales: {
          x: {
            type: 'linear',
            border: {
              display: false,
            },
            ticks: {
              maxTicksLimit: 5,
              callback: (value) => `${value} mins`,
              color: textColor[currentTheme],
            },
            grid: {
              color: gridColor[currentTheme],
            },
          },
          y: {
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
      },
    };

    const newChart = new Chart(ctx, config);
    setChart(newChart);

    return () => {
      newChart.destroy();
    };
  }, [data, currentTheme, title]);

  return (
    <React.Fragment>
      <div className="grow">
        <canvas ref={canvas} width={width} height={height}></canvas>
      </div>
    </React.Fragment>
  );
}

export default SplitBar;




// import React, { useRef, useEffect, useState } from 'react';
// import { useThemeProvider } from '../utils/ThemeContext';
// import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
// import 'chartjs-adapter-moment';
// import { tailwindConfig, formatValue } from '../utils/Utils';
// import { chartColors } from './ChartjsConfig';

// Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

// function SplitBar({ data, width, height }) {
//   const [chart, setChart] = useState(null);
//   const canvas = useRef(null);
//   const legend = useRef(null);
//   const { currentTheme } = useThemeProvider();
//   const { textColor, gridColor, tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

//   useEffect(() => {
//     const ctx = canvas.current;

//     const config = {
//       type: 'bar',
//       data: data,
//       options: {
//         indexAxis: 'y', // Horizontal bars
//         elements: {
//           bar: {
//             borderWidth: 2, // Border width of each bar
//           }
//         },
//         responsive: true,
//         plugins: {
//           legend: {
//             position: 'top',
//           },
//           title: {
//             display: true,
//             text: 'Chart.js Horizontal Bar Chart with Multiple Datasets'
//           },
//           tooltip: {
//             callbacks: {
//               title: () => false, // Disable tooltip title
//               label: (context) => `${formatValue(context.parsed.x)} mins`, // Use x value for label
//             },
//             bodyColor: tooltipBodyColor[currentTheme],
//             backgroundColor: tooltipBgColor[currentTheme],
//             borderColor: tooltipBorderColor[currentTheme],
//           },
//         },
//         scales: {
//           x: {
//             type: 'linear',
//             border: {
//               display: false,
//             },
//             ticks: {
//               maxTicksLimit: 5,
//               callback: (value) => `${value} mins`,
//               color: textColor[currentTheme],
//             },
//             grid: {
//               color: gridColor[currentTheme],
//             },
//           },
//           y: {
//             type: 'category',
//             border: {
//               display: false,
//             },
//             grid: {
//               display: false,
//             },
//             ticks: {
//               color: textColor[currentTheme],
//             },
//           },
//         },
//       },
//     };

//     const newChart = new Chart(ctx, config);
//     setChart(newChart);

//     return () => {
//       newChart.destroy();
//     };
//   }, [data, currentTheme]);

//   return (
//     <React.Fragment>
//       <div className="px-5 py-3">
//         <ul ref={legend} className="flex flex-wrap"></ul>
//       </div>
//       <div className="grow">
//         <canvas ref={canvas} width={width} height={height}></canvas>
//       </div>
//     </React.Fragment>
//   );
// }

// export default SplitBar;
