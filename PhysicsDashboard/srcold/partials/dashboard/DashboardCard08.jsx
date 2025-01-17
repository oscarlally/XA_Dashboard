// DashboardCard06.jsx

import React, { useState, useEffect } from 'react';
import DoughnutChart from '../../charts/DoughnutChart';
import moment from 'moment';

function DashboardCard06({ selectedDates }) {
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
        const filename = `utilisation_data_${endDate}.json`;

        console.log('Fetching data for filename:', filename);
        const response = await fetch(`../../../data/efficiency/GMRI1/${filename}`);
        const data = await response.json();
        console.log(`Fetched data for ${filename}:`, data);

        setChartData({
          labels: data.labels,
          datasets: [
            {
              label: 'Scanner Utilisation',
              data: data.data,
              backgroundColor: ['green', 'blue', 'purple', 'red'],
              hoverBackgroundColor: ['darkgreen', 'darkblue', 'darkpurple', 'darkred'],
              borderWidth: 0,
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
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Scanner Utilisation</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      {chartData ? (
        <DoughnutChart key={JSON.stringify(chartData)} data={chartData} width={389} height={260} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default DashboardCard06;
