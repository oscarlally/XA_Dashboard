import React, { useState, useEffect } from 'react';
import HorizBarChart from '../../charts/BarChart01';
import AverageLengths from '../../extrafuncs/AverageLengths';

// Import utilities
import { tailwindConfig } from '../../utils/Utils';

function DashboardCardAnatomy({ selectedDates, scannerName }) {

  const [chartData, setChartData] = useState(null);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
 
        const filenamesArray = [];
        const filesetData = [];

        filenamesArray.push(`anatomyLength.json`);


        for (let i = 0; i < filenamesArray.length; i++) {
          const response_data = `../../../data/scanLengths/${filenamesArray[i]}`;
          const responses = await fetch(response_data);
          const datasets = await responses.json()
          filesetData.push(datasets);
        }

        const [datalabels, avgData] = AverageLengths(filesetData);

        setChartData({
            labels: datalabels[0],
            datasets: [
              // Light blue bars
              {
                label: 'Average Times',
                data: avgData[0],
                backgroundColor: tailwindConfig().theme.colors.green[500],
                hoverBackgroundColor: tailwindConfig().theme.colors.green[700],
                barPercentage: 0.66,
                categoryPercentage: 0.66,
              },
            ],
            },
        //     {
        //     labels: datalabels[0],
        //     datasets: [
        //       // Light blue bars
        //       {
        //         label: 'Other times',
        //         data: avgData[0],
        //         backgroundColor: tailwindConfig().theme.colors.red[400],
        //         hoverBackgroundColor: tailwindConfig().theme.colors.red[500],
        //         barPercentage: 0.66,
        //         categoryPercentage: 0.66,
        //       },
        //     ],
        // }
        );

        console.log('chartData', chartData)
      
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
  }, [selectedDates]);



  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Protocol Times</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <HorizBarChart
        data={chartData}
        width={595}
        height={1000}
      />  
    </div>
  );
}

export default DashboardCardAnatomy;
