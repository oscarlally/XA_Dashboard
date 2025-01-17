
import React, { useState, useEffect } from 'react';
import LineChart from '../../charts/LineChart';
import DateRange from '../../extrafuncs/DateRange';
import DataTemp from '../../extrafuncs/DataTemp';

function DashboardCardTemp1({ selectedDates, scannerName }) {
  const [chartData, setChartData] = useState(null);
  const [currentTemp, setCurrentTemp] = useState(null);
  const [currentHumid, setCurrentHumid] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null); // Reset error state
        setChartData(null); // Set chart data to null initially

        if (!selectedDates || selectedDates.length !== 2) {
          setError("No data for this date range.  Scanner was likely not being used.");
          return;
        }

        const startDate = selectedDates[0];
        const endDate = selectedDates[1];

        const dateArray = DateRange(startDate, endDate, 0);
        const datesArrayMod = DateRange(startDate, endDate, 1);

        const filenamesArray = [];
        const filesetData = [];
        const dateArrayMod = [];

        for (let i = 0; i < dateArray.length; i++) {
          filenamesArray.push(`temp_data_${dateArray[i]}.json`);
        }

        for (let i = 0; i < filenamesArray.length; i++) {
          const response_data = `../../../data/temp/${scannerName}/${filenamesArray[i]}`;
          try {
            const responses = await fetch(response_data);
            const datasets = await responses.json();
            filesetData.push(datasets);
            dateArrayMod.push(datesArrayMod[i]);
          } catch (error) {
            console.error('Error fetching or parsing JSON:', error);
            // Log the error and continue with the next iteration
            continue;
          }
        }

        if (filesetData.length === 0) {
          setError("No data for this date range.  Scanner was likely not being used."); // Set error message if no data is available
          return;
        }

        const [tempList, humList] = DataTemp(filesetData);

        const humData = humList.map(str => parseInt(str, 10));
        const tempData = tempList.map(str => parseInt(str, 10));

        let lastIndexTemp = tempData.length - 1;
        setCurrentTemp(tempData[lastIndexTemp]);

        let lastIndexHumid = humData.length - 1;
        setCurrentHumid(humData[lastIndexHumid]);

        setChartData({
          labels: dateArrayMod,
          datasets: [
            {
              label: 'Temperature',
              data: tempData,
              fill: true,
              backgroundColor: 'rgba(255, 0, 0, 0.08)',
              borderColor: 'rgb(255, 0, 0)',
              borderWidth: 2,
              tension: 0,
              pointRadius: 0,
              pointHoverRadius: 3,
              pointBackgroundColor: 'rgb(255, 0, 0)',
              pointHoverBackgroundColor: 'rgb(255, 0, 0)',
              pointBorderWidth: 0,
              pointHoverBorderWidth: 0,
              clip: 20,
            },
            {
              label: 'Humidity',
              data: humData,
              borderColor: 'rgb(0, 0, 255)',
              borderWidth: 2,
              tension: 0,
              pointRadius: 0,
              pointHoverRadius: 3,
              pointBackgroundColor: 'rgb(0, 0, 255)',
              pointHoverBackgroundColor: 'rgb(0, 0, 255)',
              pointBorderWidth: 0,
              pointHoverBorderWidth: 0,
              clip: 20,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setError("Failed to fetch data. Please try again later.");
      }
    };

    fetchData();
  }, [selectedDates, scannerName]);

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      {error && <div className="px-5 py-2 bg-red-100 text-red-700">{error}</div>}
      {!chartData ? (
        <div className="flex items-center justify-center px-5 py-10">Loading...</div>
      ) : (
        <>
          <div className="px-5 pt-5">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Today's Scanner Details</h2>
            <div className="flex items-start">
              <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mr-2">{currentTemp}°C at {currentHumid}%</div>
            </div>
          </div>
          <div className="grow max-sm:max-h-[128px] xl:max-h-[256px]">
            <LineChart data={chartData} width={389} height={400} />
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardCardTemp1;
















// Second draft

// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import LineChart from '../../charts/LineChart';
// import DateRange from '../../extrafuncs/DateRange';
// import DataTemp from '../../extrafuncs/DataTemp';
// import moment from 'moment';

// // Import utilities
// import { tailwindConfig, hexToRGB } from '../../utils/Utils';

// function DashboardCardTemp1({ selectedDates, scannerName }) {

//   const [chartData, setChartData] = useState(null);
//   const [currentTemp, setCurrentTemp] = useState(null)
//   const [currentHumid, setCurrentHumid] = useState(null)
//   const [error, setError] = useState(null); // New state for error handling

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setError(null); // Reset error state
//         if (!selectedDates || selectedDates.length !== 2) {
//           setChartData(null);
//           setError("No data for this date range.  Scanner was likely not being used."); // Set error message for invalid date range
//           return;
//         }

//         const startDate = selectedDates[0];
//         const endDate = selectedDates[1];

//         const dateArray = DateRange(startDate, endDate, 0);
//         const datesArrayMod = DateRange(startDate, endDate, 1);

//         const filenamesArray = [];
//         const filesetData = [];
//         const dateArrayMod = [];

//         for (let i = 0; i < dateArray.length; i++) {
//           filenamesArray.push(`temp_data_${dateArray[i]}.json`);
//         }

//         for (let i = 0; i < filenamesArray.length; i++) {
//           const response_data = `../../../data/temp/${scannerName}/${filenamesArray[i]}`;
//           try {
//             const responses = await fetch(response_data);
//             const datasets = await responses.json();
//             filesetData.push(datasets);
//             dateArrayMod.push(datesArrayMod[i]);
//           } catch (error) {
//             console.error('Error fetching or parsing JSON:', error);
//             // Log the error and continue with the next iteration
//             continue;
//           }
//         }

//         if (filesetData.length === 0) {
//           setError("No data for this date range.  Scanner was likely not being used.")
//         }

//         console.log('temp', filesetData);
        
//         const [tempList, humList] = DataTemp(filesetData);

//         const humData = humList.map(str => parseInt(str, 10));
//         const tempData = tempList.map(str => parseInt(str, 10));

//         let lastIndexTemp = tempData.length - 1;
//         setCurrentTemp(tempData[lastIndexTemp]);

//         let lastIndexHumid = humData.length - 1;
//         setCurrentHumid(humData[lastIndexHumid]);

//         setChartData({
//           labels: dateArrayMod,
//           datasets: [
//             {
//               label: 'Temperature',
//               data: tempData,
//               fill: true,
//               backgroundColor: `rgba(${hexToRGB(tailwindConfig().theme.colors.blue[500])}, 0.08)`,
//               borderColor: 'rgb(255, 0, 0)',
//               borderWidth: 2,
//               tension: 0,
//               pointRadius: 0,
//               pointHoverRadius: 3,
//               pointBackgroundColor: 'rgb(255, 0, 0)',
//               pointHoverBackgroundColor: 'rgb(255, 0, 0)',
//               pointBorderWidth: 0,
//               pointHoverBorderWidth: 0,
//               clip: 20,
//             },
//             {
//               label: 'Humidity',
//               data: humData,
//               borderColor: 'rgb(0, 0, 255)',
//               borderWidth: 2,
//               tension: 0,
//               pointRadius: 0,
//               pointHoverRadius: 3,
//               pointBackgroundColor: 'rgb(0, 0, 255)',
//               pointHoverBackgroundColor: 'rgb(0, 0, 255)',
//               pointBorderWidth: 0,
//               pointHoverBorderWidth: 0,
//               clip: 20,
//             },
//           ],       
//         });
//       } catch (error) {
//         console.error('Error fetching chart data:', error);
//         setError("No data for today.  Scanner was likely not being used."); // Set error message for general fetching error
//       }
//     };

//     fetchData();
//   }, [selectedDates]);

//   return (
//     <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
//       {error && <div className="px-5 py-2 bg-red-100 text-red-700">{error}</div>} {/* Display error message if error exists */}
//       <div className="px-5 pt-5">
//         <header className="flex justify-between items-start mb-2">
//         </header>
//         <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Today's Scanner Details</h2>
//         <div className="flex items-start">
//           <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mr-2">{currentTemp}°C at {currentHumid}%</div>
//         </div>
//       </div>
//       <div className="grow max-sm:max-h-[128px] xl:max-h-[256px]">
//         <LineChart data={chartData} width={389} height={400} />
//       </div>
//     </div>
//   );
// }

// export default DashboardCardTemp1;






// First draft
// // DashboardCardTemp1.jsx

// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import LineChart from '../../charts/LineChart';
// import DateRange from '../../extrafuncs/DateRange';
// import DataTemp from '../../extrafuncs/DataTemp';
// import moment from 'moment';


// // Import utilities
// import { tailwindConfig, hexToRGB } from '../../utils/Utils';

// function DashboardCardTemp1({ selectedDates, scannerName }) {

//   const [chartData, setChartData] = useState(null);
//   const [currentTemp, setCurrentTemp] = useState(null)
//   const [currentHumid, setCurrentHumid] = useState(null)

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (!selectedDates || selectedDates.length !== 2) {
          
//           // If no valid date range, set chart data to null or default values
//           setChartData(null);
//           return;
//         }

//         const startDate = selectedDates[0];
//         const endDate = selectedDates[1];

//         console.log('Dates', startDate, endDate);


//         const dateArray = DateRange(startDate, endDate, 0);  

//         const filenamesArray = [];
//         const filesetData = [];

//         for (let i = 0; i < dateArray.length; i++) {
//           filenamesArray.push(`temp_data_${dateArray[i]}.json`);
//         }

//         for (let i = 0; i < filenamesArray.length; i++) {
//           const response_data = `../../../data/temp/${scannerName}/${filenamesArray[i]}`;
//           const responses = await fetch(response_data);
          
//           try {
//             const datasets = await responses.json();
//             filesetData.push(datasets);
//           } catch (error) {
//             console.error('Error parsing JSON:', error);
//             // Handle the error, such as logging it or skipping this file
//           }
//         }

//         const [tempList, humList] = DataTemp(filesetData);

//         const humData = humList.map(str => parseInt(str, 10));
//         const tempData = tempList.map(str => parseInt(str, 10));

//         let lastIndexTemp = tempData.length - 1;
//         setCurrentTemp(tempData[lastIndexTemp]);

//         let lastIndexHumid = humData.length - 1;
//         setCurrentHumid(humData[lastIndexHumid]);

//         const datesArrayMod = DateRange(startDate, endDate, 1);

//         setChartData({
//           labels: datesArrayMod,
//           datasets: [
//             // Bright Red line for Temperature
//             {
//               label: 'Temperature',
//               data: tempData,
//               fill: true,
//               backgroundColor: `rgba(${hexToRGB(tailwindConfig().theme.colors.blue[500])}, 0.08)`,
//               borderColor: 'rgb(255, 0, 0)', // Bright Red color
//               borderWidth: 2,
//               tension: 0,
//               pointRadius: 0,
//               pointHoverRadius: 3,
//               pointBackgroundColor: 'rgb(255, 0, 0)', // Bright Red color
//               pointHoverBackgroundColor: 'rgb(255, 0, 0)', // Bright Red color
//               pointBorderWidth: 0,
//               pointHoverBorderWidth: 0,
//               clip: 20,
//             },
//             // Bright Blue line for Humidity
//             {
//               label: 'Humidity',
//               data: humData,
//               borderColor: 'rgb(0, 0, 255)', // Bright Blue color
//               borderWidth: 2,
//               tension: 0,
//               pointRadius: 0,
//               pointHoverRadius: 3,
//               pointBackgroundColor: 'rgb(0, 0, 255)', // Bright Blue color
//               pointHoverBackgroundColor: 'rgb(0, 0, 255)', // Bright Blue color
//               pointBorderWidth: 0,
//               pointHoverBorderWidth: 0,
//               clip: 20,
//             },
//           ],       
//         });
//       } catch (error) {
//         console.error('Error fetching chart data:', error);
//       }
//     };

//     fetchData();
//   }, [selectedDates]);



//   return (
//     <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
//       <div className="px-5 pt-5">
//         <header className="flex justify-between items-start mb-2">
//         </header>
//         <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Today's Scanner Details</h2>
//         <div className="flex items-start">
//           <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mr-2">{currentTemp}°C at {currentHumid}%</div>
//         </div>
//       </div>
//       {/* Chart built with Chart.js 3 */}
//       <div className="grow max-sm:max-h-[128px] xl:max-h-[256px]">
//         {/* Change the height attribute to adjust the chart height */}
//         <LineChart data={chartData} width={389} height={400} />
//       </div>
//     </div>
//   );
// }

// export default DashboardCardTemp1;
