import React, { useRef, useEffect, useState } from 'react';
import { useThemeProvider } from '../utils/ThemeContext';
import { chartColors } from './ChartjsConfig';
import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-moment';

// Import utilities
import { tailwindConfig } from '../utils/Utils';

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

function SidebarchartUtils({
  data,
  height,
  subtitle,
  time,
}) {
  const [chart, setChart] = useState(null);
  const canvas = useRef(null);
  const legend = useRef(null);
  const { currentTheme } = useThemeProvider();
  const darkMode = currentTheme === 'dark';
  const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

  // Dynamic width calculation
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Sort the data by the label
    const sortedData = {
      labels: [...data.labels].sort(),
      datasets: data.datasets.map((dataset) => ({
        ...dataset,
        data: dataset.data.slice().sort((a, b) => data.labels.indexOf(a) - data.labels.indexOf(b)),
      })),
    };

    const ctx = canvas.current.getContext('2d');
    const newChart = new Chart(ctx, {
      type: 'bar',
      data: sortedData,
      options: {
        indexAxis: 'y',
        layout: {
          padding: {
            top: 20,
            bottom: 20,
            left: 20,
            right: 20,
          },
        },
        scales: {
          x: {
            stacked: true,
            display: false,
            max: 100,
          },
          y: {
            stacked: true,
            display: true,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: () => false, // Disable tooltip title
              label: (context) => `${context.parsed.x.toFixed(1)/10} mins`
            },
            bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
            borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
          },
          title: {
            display: !!subtitle,
            text: subtitle,
            position: 'top',
            align: 'start',
            font: {
              size: 12,
              weight: 'normal',
            },
            color: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
            padding: {
              top: 10,
              bottom: 10,
            },
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

            // Generate legend items
            const labelData = {};
            c.data.datasets.forEach((dataset, datasetIndex) => {
              dataset.data.forEach((value, index) => {
                const label = dataset.label;
                if (!labelData[label]) {
                  labelData[label] = { value: 0, color: dataset.backgroundColor };
                }
                labelData[label].value += value;
              });
            });

            const total = Object.values(labelData).reduce((a, b) => a + b.value, 0);
            Object.keys(labelData).forEach((label) => {
              const li = document.createElement('li');
              li.style.display = 'flex';
              li.style.justifyContent = 'space-between';
              li.style.alignItems = 'center';
              li.style.paddingTop = tailwindConfig().theme.padding[2.5];
              li.style.paddingBottom = tailwindConfig().theme.padding[2.5];
              const wrapper = document.createElement('div');
              wrapper.style.display = 'flex';
              wrapper.style.alignItems = 'center';
              const box = document.createElement('div');
              box.style.width = tailwindConfig().theme.width[3];
              box.style.height = tailwindConfig().theme.width[3];
              box.style.borderRadius = tailwindConfig().theme.borderRadius.sm;
              box.style.marginRight = tailwindConfig().theme.margin[3];
              box.style.backgroundColor = labelData[label].color;
              const labelEl = document.createElement('div');
              const valueEl = document.createElement('div');
              valueEl.style.fontWeight = tailwindConfig().theme.fontWeight.medium;
              valueEl.style.marginLeft = tailwindConfig().theme.margin[3];
              valueEl.style.color = label === 'Other' ? tailwindConfig().theme.colors.slate[400] : labelData[label].color;
              const computedValue = parseInt((labelData[label].value * time) / 100); // Calculate computed value
              const valueText = (computedValue === 1) ? document.createTextNode(`${computedValue} min`) : document.createTextNode(`${computedValue} mins`);
              const labelText = (label === "Dead") ? document.createTextNode(`Idle time`) : document.createTextNode(`${label} time`);
              valueEl.appendChild(valueText);
              labelEl.appendChild(labelText);
              ul.appendChild(li);
              li.appendChild(wrapper);
              li.appendChild(valueEl);
              wrapper.appendChild(box);
              wrapper.appendChild(labelEl);
            });
          },
        },
      ],
    });
    setChart(newChart);
    return () => newChart.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, windowWidth, subtitle]);

  useEffect(() => {
    if (!chart) return;

    if (darkMode) {
      chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.dark;
      chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.dark;
      chart.options.plugins.tooltip.borderColor = tooltipBorderColor.dark;
      chart.options.plugins.title.color = tooltipBodyColor.dark;
    } else {
      chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.light;
      chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.light;
      chart.options.plugins.tooltip.borderColor = tooltipBorderColor.light;
      chart.options.plugins.title.color = tooltipBodyColor.light;
    }
    chart.update('none');
  }, [currentTheme]);

  return (
    <div className="grow flex flex-col justify-center">
      <div className="w-full">
        <canvas ref={canvas} style={{ width: '100%', height: `${height}px` }}></canvas>
      </div>
      <div className="px-5 pt-2 pb-2">
        <ul ref={legend} className="text-sm divide-y divide-slate-100 dark:divide-slate-700"></ul>
      </div>
    </div>
  );
}

export default SidebarchartUtils;



// import React, { useRef, useEffect, useState } from 'react';
// import { useThemeProvider } from '../utils/ThemeContext';
// import { chartColors } from './ChartjsConfig';
// import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js';
// import 'chartjs-adapter-moment';

// // Import utilities
// import { tailwindConfig } from '../utils/Utils';

// Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

// function SidebarchartUtils({
//   data,
//   height,
//   subtitle,
//   time,
// }) {
//   const [chart, setChart] = useState(null);
//   const canvas = useRef(null);
//   const legend = useRef(null);
//   const { currentTheme } = useThemeProvider();
//   const darkMode = currentTheme === 'dark';
//   const { tooltipBodyColor, tooltipBgColor, tooltipBorderColor } = chartColors;

//   // Dynamic width calculation
//   const [windowWidth, setWindowWidth] = useState(window.innerWidth);

//   useEffect(() => {
//     const handleResize = () => {
//       setWindowWidth(window.innerWidth);
//     };

//     window.addEventListener('resize', handleResize);

//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   }, []);

//   useEffect(() => {
//     // Sort the data by the label
//     const sortedData = {
//       labels: [...data.labels].sort(),
//       datasets: data.datasets.map((dataset) => ({
//         ...dataset,
//         data: dataset.data.slice().sort((a, b) => data.labels.indexOf(a) - data.labels.indexOf(b)),
//       })),
//     };

//     const ctx = canvas.current.getContext('2d');
//     const newChart = new Chart(ctx, {
//       type: 'bar',
//       data: sortedData,
//       options: {
//         indexAxis: 'y',
//         layout: {
//           padding: {
//             top: 20,
//             bottom: 20,
//             left: 20,
//             right: 20,
//           },
//         },
//         scales: {
//           x: {
//             stacked: true,
//             display: true,
//             max: 100,
//           },
//           y: {
//             stacked: true,
//             display: true,
//           },
//         },
//         plugins: {
//           legend: {
//             display: false,
//           },
//           tooltip: {
//             callbacks: {
//               title: () => false, // Disable tooltip title
//               label: (context) => `${context.parsed.x.toFixed(1)} %`
//             },
//             bodyColor: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
//             backgroundColor: darkMode ? tooltipBgColor.dark : tooltipBgColor.light,
//             borderColor: darkMode ? tooltipBorderColor.dark : tooltipBorderColor.light,
//           },
//           title: {
//             display: !!subtitle,
//             text: subtitle,
//             position: 'top',
//             align: 'start',
//             font: {
//               size: 12,
//               weight: 'normal',
//             },
//             color: darkMode ? tooltipBodyColor.dark : tooltipBodyColor.light,
//             padding: {
//               top: 10,
//               bottom: 10,
//             },
//           },
//         },
//         interaction: {
//           intersect: false,
//           mode: 'nearest',
//         },
//         animation: {
//           duration: 500,
//         },
//         maintainAspectRatio: false,
//         resizeDelay: 200,
//       },
//       plugins: [
//         {
//           id: 'htmlLegend',
//           afterUpdate(c, args, options) {
//             const ul = legend.current;
//             if (!ul) return;
//             // Remove old legend items
//             while (ul.firstChild) {
//               ul.firstChild.remove();
//             }

//             // Generate legend items
//             const labelData = {};
//             c.data.datasets.forEach((dataset, datasetIndex) => {
//               dataset.data.forEach((value, index) => {
//                 const label = dataset.label;
//                 if (!labelData[label]) {
//                   labelData[label] = { value: 0, color: dataset.backgroundColor };
//                 }
//                 labelData[label].value += value;
//               });
//             });

//             const total = Object.values(labelData).reduce((a, b) => a + b.value, 0);
//             Object.keys(labelData).forEach((label) => {
//               const li = document.createElement('li');
//               li.style.display = 'flex';
//               li.style.justifyContent = 'space-between';
//               li.style.alignItems = 'center';
//               li.style.paddingTop = tailwindConfig().theme.padding[2.5];
//               li.style.paddingBottom = tailwindConfig().theme.padding[2.5];
//               const wrapper = document.createElement('div');
//               wrapper.style.display = 'flex';
//               wrapper.style.alignItems = 'center';
//               const box = document.createElement('div');
//               box.style.width = tailwindConfig().theme.width[3];
//               box.style.height = tailwindConfig().theme.width[3];
//               box.style.borderRadius = tailwindConfig().theme.borderRadius.sm;
//               box.style.marginRight = tailwindConfig().theme.margin[3];
//               box.style.backgroundColor = labelData[label].color;
//               const labelEl = document.createElement('div');
//               const valueEl = document.createElement('div');
//               valueEl.style.fontWeight = tailwindConfig().theme.fontWeight.medium;
//               valueEl.style.marginLeft = tailwindConfig().theme.margin[3];
//               valueEl.style.color = label === 'Other' ? tailwindConfig().theme.colors.slate[400] : labelData[label].color;
//               const percentage = (labelData[label].value / total) * 100;
//               const valueText = document.createTextNode(`${parseInt(percentage)}%`);
//               const labelText = document.createTextNode(`${label} (${parseInt(percentage)}%)`);
//               valueEl.appendChild(valueText);
//               labelEl.appendChild(labelText);
//               ul.appendChild(li);
//               li.appendChild(wrapper);
//               li.appendChild(valueEl);
//               wrapper.appendChild(box);
//               wrapper.appendChild(labelEl);
//             });
//           },
//         },
//       ],
//     });
//     setChart(newChart);
//     return () => newChart.destroy();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [data, windowWidth, subtitle]);

//   useEffect(() => {
//     if (!chart) return;

//     if (darkMode) {
//       chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.dark;
//       chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.dark;
//       chart.options.plugins.tooltip.borderColor = tooltipBorderColor.dark;
//       chart.options.plugins.title.color = tooltipBodyColor.dark;
//     } else {
//       chart.options.plugins.tooltip.bodyColor = tooltipBodyColor.light;
//       chart.options.plugins.tooltip.backgroundColor = tooltipBgColor.light;
//       chart.options.plugins.tooltip.borderColor = tooltipBorderColor.light;
//       chart.options.plugins.title.color = tooltipBodyColor.light;
//     }
//     chart.update('none');
//   }, [currentTheme]);

//   return (
//     <div className="grow flex flex-col justify-center">
//       <div className="w-full">
//         <canvas ref={canvas} style={{ width: '100%', height: `${height}px` }}></canvas>
//       </div>
//       <div className="px-5 pt-2 pb-2">
//         <ul ref={legend} className="text-sm divide-y divide-slate-100 dark:divide-slate-700"></ul>
//       </div>
//     </div>
//   );
// }

// export default SidebarchartUtils;