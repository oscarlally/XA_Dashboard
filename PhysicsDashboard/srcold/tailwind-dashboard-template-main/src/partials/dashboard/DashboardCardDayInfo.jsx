import React, { useState, useEffect } from 'react';
import DoughnutChart from '../../charts/DoughnutChart';
import DateRange from '../../extrafuncs/DateRange';
import AverageData from '../../extrafuncs/AverageData';
import replaceString from '../../extrafuncs/replaceString';

function DashboardCardDayInfo({ selectedDates, scannerName }) {
  const [chartData, setChartData] = useState(null);
  const [centreNo, setCentreNo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null); // Reset error state

        if (!selectedDates || selectedDates.length !== 2) {
          setChartData(null);
          setError("No valid date range selected."); // Set error message for invalid date range
          return;
        }

        const startDate = selectedDates[0];
        const endDate = selectedDates[1];

        const dateArray = DateRange(startDate, endDate, 0);
        const filenamesArray = [];
        const filesetData = [];

        for (let i = 0; i < dateArray.length; i++) {
          const currentDatePre = dateArray[i].replace(/_/g, '-');
          const currentDate = currentDatePre.replace(/2024/g, '24');
          filenamesArray.push(`${currentDate}.json`);
        }

        console.log('test', filenamesArray);

        for (let i = 0; i < filenamesArray.length; i++) {
          const response_data = `../../../data/dayInfo/${scannerName}/${filenamesArray[i]}`;
          try {
            const responses = await fetch(response_data);
            const datasets = await responses.json();
            filesetData.push(datasets);
          } catch (error) {
            console.error('Error fetching or parsing JSON:', error);
            continue;
          }
        }

        if (filesetData.length === 0) {
          setChartData(null); // Set chartData to null if filesetData is empty
          return;
        }

        const [avgData, labels] = AverageData(filesetData);
        let newLabels = replaceString(labels, "Dead", "Idle");

        const newCentreNo = `Total On: ${avgData[1]}%`;
        setCentreNo(newCentreNo);

        setChartData({
          labels: newLabels,
          datasets: [
            {
              data: avgData,
              backgroundColor: ['green', 'blue', 'purple', 'red'],
              hoverBackgroundColor: ['darkgreen', 'darkblue', 'darkpurple', 'darkred'],
              borderWidth: 0,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
        setError("No data for this date range.  Scanner was likely not being used.");
      }
    };

    fetchData();
  }, [selectedDates, scannerName]);


  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      {error && <div className="px-5 py-2 bg-red-100 text-red-700">{error}</div>}
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Scanner Utilisation</h2>
      </header>
      {chartData ? (
        <DoughnutChart key={JSON.stringify(chartData)} centerNumber={centreNo} response={false} data={chartData} width={389} height={260} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default DashboardCardDayInfo;






// import React, { useState, useEffect } from 'react';
// import DoughnutChart from '../../charts/DoughnutChart';
// import DateRange from '../../extrafuncs/DateRange';
// import AverageData from '../../extrafuncs/AverageData';
// import moment from 'moment';

// function DashboardCardEfficiency({ selectedDates, scannerName }) {

//   const [chartData, setChartData] = useState(null);
//   const [centreNo, setCentreNo] = useState(null);
//   const response = false;

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

//         const dateArray = DateRange(startDate, endDate, 0);  
//         const filenamesArray = [];
//         const filesetData = [];

//         for (let i = 0; i < dateArray.length; i++) {
//           filenamesArray.push(`${dateArray[i]}/utilisation_total.json`);
//         }

//         for (let i = 0; i < filenamesArray.length; i++) {
//           const response_data = `../../../data/utilisation/${scannerName}/${filenamesArray[i]}`;
//           const responses = await fetch(response_data);
          
//           try {
//             const datasets = await responses.json();
//             filesetData.push(datasets);
//           } catch (error) {
//             console.error('Error parsing JSON:', error);
//             // Handle the error, such as logging it or skipping this file
//           }
//         }

//         const [avgData, labels] = AverageData(filesetData);

//         const newCentreNo = `Total On: ${avgData[1]}%`;
//         setCentreNo(newCentreNo);

//         setChartData({
//           labels: labels,
//           datasets: [
//             {
//               label: 'Scanner Utilisation',
//               data: avgData,
//               backgroundColor: ['green', 'blue', 'purple', 'red'],
//               hoverBackgroundColor: ['darkgreen', 'darkblue', 'darkpurple', 'darkred'],
//               borderWidth: 0,
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
//       <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
//         <h2 className="font-semibold text-slate-800 dark:text-slate-100">Scanner Utilisation</h2>
//       </header>
//       {/* Chart built with Chart.js 3 */}
//       {/* Change the height attribute to adjust the chart height */}
//       {chartData ? (
//         <DoughnutChart key={JSON.stringify(chartData)} centerNumber={centreNo} response={response} data={chartData} width={389} height={260} />
//       ) : (
//         <div>Loading...</div>
//       )}
//     </div>
//   );
// }

// export default DashboardCardEfficiency;
