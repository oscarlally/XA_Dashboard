// DashboardCardUtilPlot.jsx


import React, { useState, useEffect } from 'react';
import SidebarchartUtils from '../../charts/SidebarchartUtils';
import DateRange from '../../extrafuncs/DateRange';
import AverageDataUtils from '../../extrafuncs/AverageDataUtils';
import moment from 'moment';
import { tailwindConfig } from '../../utils/Utils';

function DashboardCardUtilPlot({ selectedDates, scannerName }) {

  const [chartData, setChartData] = useState(null);
  const [start, setStart] = useState(null)
  const [end, setEnd] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!selectedDates || selectedDates.length !== 2) {
          
          // If no valid date range, set chart data to null or default values
          setChartData(null);
          return;
        }

        const startDate = selectedDates[1];
        const endDate = selectedDates[1];


        const dateArray = DateRange(startDate, endDate, 0);  
        const filenamesArray = [];
        const filesetData = [];

        for (let i = 0; i < dateArray.length; i++) {
          filenamesArray.push(`utilisation_data_${dateArray[i]}.json`);
        }

        for (let i = 0; i < filenamesArray.length; i++) {
          const response_data = `../../../data/utilisation/${scannerName}/${filenamesArray[i]}`;
          const responses = await fetch(response_data);
          const datasets = await responses.json()
          filesetData.push(datasets);
        }

        const [avgData, sublabels, start, end] = AverageDataUtils(filesetData);

        setStart(start);
        setEnd(end);


        const colors = [
          "lightgreen",
          "lightblue",
          "yellow",
          "red",
        ];

        const hoverColors = [
          "#4CAF50", // Darker shade of lightgreen
          "#2196F3", // Darker shade of lightblue
          "#FFEB3B", // Darker shade of yellow
          "#F44336", // Darker shade of red
        ];

        const datasets = [];
        for (let i = 0; i < sublabels.length; i++) {
          let backgroundColor;
          let hoverBackgroundColor;

          // Set backgroundColor based on label name
          if (sublabels[i] === "Shim") {
            backgroundColor = colors[0];
            hoverBackgroundColor = hoverColors[0];
          } else if (sublabels[i] === "Scan") {
            backgroundColor = colors[1];
            hoverBackgroundColor = hoverColors[1];
          } else if (sublabels[i] === "Break") {
            backgroundColor = colors[2];
            hoverBackgroundColor = hoverColors[2];
          } else {
            backgroundColor = colors[3];
            hoverBackgroundColor = hoverColors[3];
          }

          datasets.push({
            label: sublabels[i],
            data: [avgData[i]],
            backgroundColor: backgroundColor,
            hoverBackgroundColor: hoverBackgroundColor,
            barPercentage: 1,
            categoryPercentage: 1,
          });
        }

        setChartData({
          labels: ['Scan Day'],
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
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Utilisation Data from {start} to {end}</h2>
      </header>
      {/* Conditional rendering of Sidebarchart */}
      {chartData && (
        <div className="grow">
          {/* Change the height attribute to adjust the chart height */}
          <SidebarchartUtils 
            data={chartData} 
            width={595} 
            height={60} 
          />
        </div>
      )}
    </div>
  );
}

export default DashboardCardUtilPlot;
