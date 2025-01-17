// DashboardCard11.jsx


import React, { useState, useEffect } from 'react';
import Sidebarchart from '../../charts/Sidebarchart';
import DateRange from '../../extrafuncs/DateRange';
import AverageData from '../../extrafuncs/AverageData';
import moment from 'moment';
import { tailwindConfig } from '../../utils/Utils';

function DashboardCard11({ selectedDates, scannerName }) {

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
          filenamesArray.push(`anatomy_data_${dateArray[i]}.json`);
        }

        for (let i = 0; i < filenamesArray.length; i++) {
          const response_data = `../../../data/anatomy/${scannerName}/${filenamesArray[i]}`;
          const responses = await fetch(response_data);
          const datasets = await responses.json()
          filesetData.push(datasets);
        }

        const [avgData, sublabels] = AverageData(filesetData);

        const colors = [
          tailwindConfig().theme.colors.indigo[500],
          tailwindConfig().theme.colors.red[800],
          tailwindConfig().theme.colors.sky[400],
          tailwindConfig().theme.colors.green[400],
          tailwindConfig().theme.colors.slate[200],
          tailwindConfig().theme.colors.red[400],
        ];

        const hoverColors = [
          tailwindConfig().theme.colors.indigo[600],
          tailwindConfig().theme.colors.red[900],
          tailwindConfig().theme.colors.sky[500],
          tailwindConfig().theme.colors.green[500],
          tailwindConfig().theme.colors.slate[300],
          tailwindConfig().theme.colors.red[500],
        ];

        const datasets = [];
        for (let i = 0; i < sublabels.length; i++) {
          datasets.push({
            label: sublabels[i],
            data: [avgData[i]],
            backgroundColor: colors[i],
            hoverBackgroundColor: hoverColors[i],
            barPercentage: 1,
            categoryPercentage: 1,
          });
        }

        setChartData({
          labels: ['Body Parts'],
          datasets: datasets,
        });
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();
  }, [selectedDates]);

  return (
    <div className="col-span-full xl:col-span-6 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Anatomy Breakdown</h2>
      </header>
      {/* Conditional rendering of Sidebarchart */}
      {chartData && (
        <div className="grow">
          {/* Change the height attribute to adjust the chart height */}
          <Sidebarchart data={chartData} width={595} height={60} />
        </div>
      )}
    </div>
  );
}

export default DashboardCard11;
