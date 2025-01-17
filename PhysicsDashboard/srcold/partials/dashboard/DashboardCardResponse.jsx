import React, { useState, useEffect } from 'react';
import DoughnutChart from '../../charts/DoughnutChart';
import DateRange from '../../extrafuncs/DateRange';
import AverageDataSafety from '../../extrafuncs/AverageDataSafety';
import moment from 'moment';

function DashboardCardResponse({ selectedDates }) {

  const [chartData, setChartData] = useState(null);
  const [centreNo, setCentreNo] = useState(null);
  const response = true;

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

        const response = AverageDataSafety(filesetData);

        const newCentreNo = `Response Rate: ${response[0]}%`;
        setCentreNo(newCentreNo);

        setChartData({
          labels: ['Replied', 'Not Replied'],
          datasets: [
            {
              label: 'Safety Request Response Rate',
              data: response,
              backgroundColor: ['green', 'red'],
              hoverBackgroundColor: ['darkgreen', 'darkred'],
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
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Response Rate</h2>
      </header>
      {/* Chart built with Chart.js 3 */}
      {/* Change the height attribute to adjust the chart height */}
      {chartData ? (
        <DoughnutChart key={JSON.stringify(chartData)} centerNumber={centreNo} response={response} data={chartData} width={389} height={260} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}

export default DashboardCardResponse;
