// DashboardCardTemp1.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LineChart from '../../charts/LineChart';
import DateRange from '../../extrafuncs/DateRange';
import DataTemp from '../../extrafuncs/DataTemp';
import moment from 'moment';


// Import utilities
import { tailwindConfig, hexToRGB } from '../../utils/Utils';

function DashboardCardTemp1({ selectedDates, scannerName }) {

  const [chartData, setChartData] = useState(null);
  const [currentTemp, setCurrentTemp] = useState(null)
  const [currentHumid, setCurrentHumid] = useState(null)

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

        console.log('Dates', startDate, endDate);


        const dateArray = DateRange(startDate, endDate, 0);  

        const filenamesArray = [];
        const filesetData = [];

        for (let i = 0; i < dateArray.length; i++) {
          filenamesArray.push(`temp_data_${dateArray[i]}.json`);
        }

        for (let i = 0; i < filenamesArray.length; i++) {
          const response_data = `../../../data/temp/${scannerName}/${filenamesArray[i]}`;
          const responses = await fetch(response_data);
          const datasets = await responses.json()
          filesetData.push(datasets);
        }

        const [tempList, humList] = DataTemp(filesetData);

        const humData = humList.map(str => parseInt(str, 10));
        const tempData = tempList.map(str => parseInt(str, 10));

        let lastIndex = tempData.length - 1;
        setCurrentTemp(tempData[lastIndex]);

        const datesArrayMod = DateRange(startDate, endDate, 1);


        console.log('Dates', datesArrayMod);
        console.log('Temperatures', tempData);

        setChartData({
          labels: datesArrayMod,
          datasets: [
            // Bright Red line for Temperature
            {
              label: 'Temperature',
              data: tempData,
              fill: true,
              backgroundColor: `rgba(${hexToRGB(tailwindConfig().theme.colors.blue[500])}, 0.08)`,
              borderColor: 'rgb(255, 0, 0)', // Bright Red color
              borderWidth: 2,
              tension: 0,
              pointRadius: 0,
              pointHoverRadius: 3,
              pointBackgroundColor: 'rgb(255, 0, 0)', // Bright Red color
              pointHoverBackgroundColor: 'rgb(255, 0, 0)', // Bright Red color
              pointBorderWidth: 0,
              pointHoverBorderWidth: 0,
              clip: 20,
            },
            // Bright Blue line for Humidity
            {
              label: 'Humidity',
              data: humData,
              borderColor: 'rgb(0, 0, 255)', // Bright Blue color
              borderWidth: 2,
              tension: 0,
              pointRadius: 0,
              pointHoverRadius: 3,
              pointBackgroundColor: 'rgb(0, 0, 255)', // Bright Blue color
              pointHoverBackgroundColor: 'rgb(0, 0, 255)', // Bright Blue color
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
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Today's Scanner Details</h2>
        <div className="flex items-start">
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100 mr-2">{currentTemp}°C at {currentTemp}%</div>
        </div>
      </div>
      {/* Chart built with Chart.js 3 */}
      <div className="grow max-sm:max-h-[128px] xl:max-h-[256px]">
        {/* Change the height attribute to adjust the chart height */}
        <LineChart data={chartData} width={389} height={400} />
      </div>
    </div>
  );
}

export default DashboardCardTemp1;
