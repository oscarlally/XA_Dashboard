// DashboardCardTemp1.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LineChartEmail from '../../charts/LineChartEmail';
import DateRange from '../../extrafuncs/DateRange';
import DataTemp from '../../extrafuncs/DataTemp';
import moment from 'moment';


// Import utilities
import { tailwindConfig, hexToRGB } from '../../utils/Utils';

function DashboardCardEmail({ selectedDates}) {

  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!selectedDates || selectedDates.length !== 2) {
          
          // If no valid date range, set chart data to null or default values
          setChartData(null);
          return;
        }

        const startDate = selectedDates[0];
        const endDate = selectedDates[1];


        const dateArray = DateRange(startDate, endDate, 0);  

        const filenamesArray = [];
        const filesetData = [];

        for (let i = 0; i < dateArray.length; i++) {
          filenamesArray.push(`email_data_${dateArray[i]}.json`);
        }

        for (let i = 0; i < filenamesArray.length; i++) {
          const response_data = `../../../data/email/${filenamesArray[i]}`;
          const responses = await fetch(response_data);
          const datasets = await responses.json()
          filesetData.push(datasets);
        }

        const allNoRequests = [];
        
        filesetData.forEach(dataset => {
          if (dataset.hasOwnProperty('noRequests')) {
            allNoRequests.push(...dataset.noRequests);
          }
        });

        const datesArrayMod = DateRange(startDate, endDate, 1);


        setChartData({
          labels: datesArrayMod,
          datasets: [
            // Bright Red line for Temperature
            {
              label: 'Number of Requests',
              data: allNoRequests,
              fill: true,
              backgroundColor: `rgba(${hexToRGB(tailwindConfig().theme.colors.blue[500])}, 0.08)`,
              borderColor: 'rgb(255, 255, 0)', // Bright Red color
              borderWidth: 2,
              tension: 0,
              pointRadius: 0,
              pointHoverRadius: 3,
              pointBackgroundColor: 'rgb(255, 255, 0)',
              pointHoverBackgroundColor: 'rgb(255, 255, 0)',
              pointBorderWidth: 0,
              pointHoverBorderWidth: 0,
              clip: 20,
            },
          ],       
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
  }, [selectedDates]);



  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      <div className="px-5 pt-5">
        <header className="flex justify-between items-start mb-2">
        </header>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Safety Requests</h2>
        <div className="flex items-start">
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow max-sm:max-h-[128px] xl:max-h-[256px]">
        {/* Change the height attribute to adjust the chart height */}
        <LineChartEmail data={chartData} width={389} height={400} />
      </div>
    </div>
  );
}

export default DashboardCardEmail;
