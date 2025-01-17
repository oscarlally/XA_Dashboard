// DashboardCard09.jsx

import React, { useState, useEffect } from 'react';
import BarChart from '../../charts/BarChart';
import { tailwindConfig } from '../../utils/Utils';

function DashboardCard09({ selectedDates }) {
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
        const filename = `sar_data_${endDate}.json`;

        console.log('Fetching SAR data for filename:', filename);
        const response = await fetch(`../../../data/SAR/GMRI1/${filename}`);
        const data = await response.json();
        console.log(`Fetched data for ${filename}:`, data);

        setChartData({
          labels: data.labels,
          datasets: [
            // Light blue bars
            {
              label: 'Predicted',
              data: data.pred_dataset,
              backgroundColor: tailwindConfig().theme.colors.blue[400],
              hoverBackgroundColor: tailwindConfig().theme.colors.blue[500],
              barPercentage: 0.66,
              categoryPercentage: 0.66,
            },
            // Blue bars
            {
              label: 'Actual',
              data: data.actual_dataset,
              backgroundColor: tailwindConfig().theme.colors.indigo[500],
              hoverBackgroundColor: tailwindConfig().theme.colors.indigo[600],
              barPercentage: 0.66,
              categoryPercentage: 0.66,
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
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Predicted vs Actual SAR</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      <BarChart data={chartData} width={595} height={248} />
    </div>
  );
}

export default DashboardCard09;
