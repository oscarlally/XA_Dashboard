import React, { useState, useEffect } from 'react';
import SidebarchartUtils from '../../charts/SidebarchartUtils';
import DateRange from '../../extrafuncs/DateRange';
import AverageDataTest from '../../extrafuncs/AverageDataTest';
import TimeDifference from '../../extrafuncs/TimeDifference';
import moment from 'moment';
import { tailwindConfig } from '../../utils/Utils';

function DashboardCardUtilPlot({ selectedDates, scannerName }) {
  const [chartData, setChartData] = useState([]);
  const [start, setStart] = useState([]);
  const [end, setEnd] = useState([]);
  const [timeDiff, setTimeDiff] = useState([]);
  const [date2, setdate2] = useState([]);
  const [error, setError] = useState(null); // New state for error handling

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null); // Reset error state
        if (!selectedDates || selectedDates.length !== 2) {
          // If no valid date range, set chart data to null or default values
          setChartData([]);
          setStart([]);
          setEnd([]);
          setError("No data for this date range. Scanner was likely not being used."); // Set error message for invalid date range
          return;
        }

        const startDate = selectedDates[0];
        const endDate = selectedDates[1];

        // Define the base path
        const basePath = `../../../data/utilisation/${scannerName}/${endDate}/`
        
        // Get the number of json files
        const checkPath = `${basePath}check.json`
        const checkResponse = await fetch(checkPath);
        const jsonDataCheck = await checkResponse.json();
        
        // Extract the value associated with the key 'check'
        const fileNo = jsonDataCheck['check'];

        // Replace underscore for graph

        setdate2(endDate.replace(/_/g, '-'));

        // Loop over the datasets

        const dateArray = DateRange(startDate, endDate, 0);
        const filenamesArray = [];
        const filesetData = [];
        const times = [];

        for (let i = 0; i < dateArray.length; i++) {
          for (let j = 1; j <= fileNo; j++) {
            filenamesArray.push(`utilisation_n${j}.json`);
          }
        }

        for (let i = 0; i < filenamesArray.length; i++) {
          const response_data = `${basePath}${filenamesArray[i]}`;
          const responses = await fetch(response_data);
          const datasets = await responses.json();
          filesetData.push([datasets]);
        }

        const chartDataArray = [];
        const startArray = [];
        const endArray = [];

        const [avgData, sublabels, startDates, endDates] = await AverageDataTest(filesetData);

        for (let i = 0; i < filesetData.length; i += 1) {
          chartDataArray.push({
            id: `ID_${i}`, // Unique identifier for each chart
            labels: [`Scan ${i+1}`],
            datasets: createDatasets(avgData[i], sublabels[i]),
          });
          startArray.push(startDates[i]);
          endArray.push(endDates[i]);
        }

        const timeArray = TimeDifference(startArray, endArray);

        setChartData(chartDataArray);
        setStart(startArray);
        setEnd(endArray);
        setTimeDiff(timeArray);
        console.log
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setError("No data for this date range. Scanner was likely not being used."); // Set error message for general fetching error
      }
    };

    fetchData();
  }, [selectedDates]);

  const createDatasets = (avgData, sublabels) => {
    const colors = [
      'green',
      'blue',
      'purple',
      'red',
    ];

    const hoverColors = [
      '#4CAF50', // Darker shade of lightgreen
      '#2196F3', // Darker shade of lightblue
      '#4B0082', // Darker shade of yellow
      '#F44336', // Darker shade of red
    ];

    return sublabels.map((label, index) => ({
      label,
      data: [avgData[index]],
      backgroundColor: getColor(label, colors),
      hoverBackgroundColor: getColor(label, hoverColors),
      barWidth: 0.04, // Adjust the bar width as needed
      categoryPercentage: 1, // Adjust the space between bars as needed
    }));
  };

  const getColor = (label, colors) => {
    if (label === 'Prep') return colors[0];
    if (label === 'Scan') return colors[1];
    if (label === 'Break') return colors[2];
    if (label === 'Dead') return colors[3];
  };

  return (
    <div className="col-span-full xl:col-span-6 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      {error && <div className="px-5 py-2 bg-red-100 text-red-700">{error}</div>} {/* Display error message if error exists */}
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">{scannerName} Utilisation Data from {date2}</h2>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {chartData.map((data, index) => (
          <div key={data.id} className="bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
            <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm text-slate-800 dark:text-slate-100">Scan {index+1} {start[index]} to {end[index]}</h2>
            </header>
            <div style={{ height: '300px' }}>
              <SidebarchartUtils
                data={data}
                width={595}
                height={120}
                time={timeDiff[index]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardCardUtilPlot;




// import React, { useState, useEffect } from 'react';
// import SidebarchartUtils from '../../charts/SidebarchartUtils';
// import DateRange from '../../extrafuncs/DateRange';
// import AverageDataTest from '../../extrafuncs/AverageDataTest';
// import moment from 'moment';
// import { tailwindConfig } from '../../utils/Utils';

// function DashboardCardUtilPlot({ selectedDates, scannerName }) {
//   const [chartData, setChartData] = useState([]);
//   const [start, setStart] = useState([]);
//   const [end, setEnd] = useState([]);
//   const [date2, setdate2] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (!selectedDates || selectedDates.length !== 2) {
//           // If no valid date range, set chart data to null or default values
//           setChartData([]);
//           setStart([]);
//           setEnd([]);
//           return;
//         }

//         const startDate = selectedDates[0];
//         const endDate = selectedDates[1];

//         // Define the base path
//         const basePath = `../../../data/utilisation/${scannerName}/${endDate}/`

//         console.log('hello', basePath)

        
//         // Get the number of json files
//         const checkPath = `${basePath}check.json`
//         const checkResponse = await fetch(checkPath);
//         const jsonDataCheck = await checkResponse.json();
        
//         // Extract the value associated with the key 'check'
//         const fileNo = jsonDataCheck['check'];

//         // Replace underscore for graph

//         setdate2(endDate.replace(/_/g, '-'));

//         // Loop over the datasets

//         const dateArray = DateRange(startDate, endDate, 0);
//         const filenamesArray = [];
//         const filesetData = [];

//         for (let i = 0; i < dateArray.length; i++) {
//           for (let j = 1; j <= fileNo; j++) {
//             filenamesArray.push(`utilisation_n${j}.json`);
//           }
//         }

//         for (let i = 0; i < filenamesArray.length; i++) {
//           const response_data = `${basePath}${filenamesArray[i]}`;
//           const responses = await fetch(response_data);
//           const datasets = await responses.json();
//           filesetData.push([datasets]);
//         }

//         const chartDataArray = [];
//         const startArray = [];
//         const endArray = [];

//         const [avgData, sublabels, startDates, endDates] = await AverageDataTest(filesetData);

//         for (let i = 0; i < filesetData.length; i += 1) {
//           chartDataArray.push({
//             id: `ID_${i}`, // Unique identifier for each chart
//             labels: [`Scan ${i+1}`],
//             datasets: createDatasets(avgData[i], sublabels[i]),
//           });
//           startArray.push(startDates[i]);
//           endArray.push(endDates[i]);
//         }

//         setChartData(chartDataArray);
//         setStart(startArray);
//         setEnd(endArray);
//       } catch (error) {
//         console.error('Error fetching chart data:', error);
//       }
//     };

//     fetchData();
//   }, [selectedDates]);

//   const createDatasets = (avgData, sublabels) => {
//     const colors = [
//       'lightgreen',
//       'lightblue',
//       'yellow',
//       'red',
//     ];

//     const hoverColors = [
//       '#4CAF50', // Darker shade of lightgreen
//       '#2196F3', // Darker shade of lightblue
//       '#FFEB3B', // Darker shade of yellow
//       '#F44336', // Darker shade of red
//     ];

//     return sublabels.map((label, index) => ({
//       label,
//       data: [avgData[index]],
//       backgroundColor: getColor(label, colors),
//       hoverBackgroundColor: getColor(label, hoverColors),
//       barWidth: 0.04, // Adjust the bar width as needed
//       categoryPercentage: 1, // Adjust the space between bars as needed
//     }));
//   };

//   const getColor = (label, colors) => {
//     if (label === 'Prep') return colors[0];
//     if (label === 'Scan') return colors[1];
//     if (label === 'Break') return colors[2];
//     if (label === 'Dead') return colors[3];
//   };

//   return (
//     <div className="col-span-full xl:col-span-6 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
//       <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
//         <h2 className="font-semibold text-slate-800 dark:text-slate-100">{scannerName} Utilisation Data from {date2}</h2>
//       </header>

//       <div className="grid grid-cols-1 gap-4">
//         {chartData.map((data, index) => (
//           <div key={data.id} className="bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
//             <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
//               <h2 className="text-sm text-slate-800 dark:text-slate-100">Scan {index+1} {start[index]} to {end[index]}</h2>
//             </header>
//             <div style={{ height: '300px' }}>
//               <SidebarchartUtils
//                 data={data}
//                 width={595}
//                 height={120}
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default DashboardCardUtilPlot;