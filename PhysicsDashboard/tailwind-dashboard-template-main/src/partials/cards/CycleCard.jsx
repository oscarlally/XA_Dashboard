import React, { useState, useEffect, useCallback } from 'react';
import DateConverterSQL from '../../extrafuncs/DateConverterSQL';
import DateRange from '../../extrafuncs/DateRange';
import { useNavigate } from 'react-router-dom';
import DoughnutChart from '../../charts/DoughnutChart';
import AverageData from '../../extrafuncs/AverageData';
import { tailwindConfig, hexToRGB } from '../../utils/Utils';
import axios from 'axios';

function CycleCard({ selectedDates }) {
  const [averageEff, setAverageEff] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState('smrvid');
  const [selectedDayType, setSelectedDayType] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  const startDate = DateConverterSQL(selectedDates[0]);
  const endDate = DateConverterSQL(selectedDates[1]);

  const datesArrayPre = DateRange(startDate, endDate, 2);
  const datesArray = [...new Set(datesArrayPre)];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!endDate || !selectedSchema) {
        setAverageEff(null);
        setChartData(null);
        return;
      }

      const token = localStorage.getItem('token'); // Or however you store the token

      if (!token) {
        setError('Authentication token is missing.');
        return;
      }

      const results = [];

      // Dynamically decide the column to query based on selectedDayType
      const columnChoice = selectedDayType === 'general' ? 'efficiency' : 'efficiency_workday';

      for (let i = 0; i < datesArray.length; i++) {
        const queryDate = String(datesArray[i]);
        console.log('hello', queryDate);

        const response = await axios.post(
          'http://10.189.108.198:3000/api/getCustomQuery',
          {
            selectedSchema,
            queryDate,
            columnName: columnChoice, // Dynamically selected column
            tableName: 'efficiencies', // The specific table you want to query
            cacheBuster: new Date().getTime(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }
        );

        const singleResult = response.data;
        const cycleTimeStr = singleResult.data.outputParam;
        const cycleTimeNum = parseFloat(cycleTimeStr);
        const cycleTimeRounded = Math.round(cycleTimeNum * 10) / 10;
        console.log('Single result', cycleTimeRounded);
        results.push(cycleTimeRounded);
      }

      console.log('Results', results);
      console.log('datesArray', datesArray);

      const sum = results.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      const averagePre = sum / results.length;
      const average = Math.round(averagePre * 10) / 10;
      const displayData = [average, 100 - average];

      if (average && average !== 0) {
        setAverageEff(average);
        setChartData({
          labels: ['Scanning', 'Break'],
          datasets: [
            {
              data: displayData,
              backgroundColor: ['green', 'red'],
              hoverBackgroundColor: ['darkgreen', 'darkred'],
              borderWidth: 0,
            },
          ],
        });

        setDataFetched(true);
      } else {
        setAverageEff(null);
        setChartData(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('No data for these parameters.');
      setChartData(null);
    } finally {
      setIsLoading(false);
    }
  }, [endDate, selectedSchema, selectedDayType, datesArray]); // Depend on selectedDayType directly

  const handleSchemaChange = (e) => {
    setSelectedSchema(e.target.value); // Only updates selectedSchema
  };

  const handleDayTypeChange = (e) => {
    setSelectedDayType(e.target.value); // Only updates selectedDayType
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Scanner Cycle Time</h2>
        <select
          name="schema"
          value={selectedSchema}
          onChange={handleSchemaChange} // Updated
          className="mt-2 p-3 border rounded w-full"
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <option value="smrvid">SMRVID</option>
          <option value="gmri3">GMRI3</option>
          <option value="gmri4">GMRI4</option>
          <option value="emri1">EMRI</option>
        </select>
        <select
          name="workday"
          value={selectedDayType}
          onChange={handleDayTypeChange} // Updated
          className="mt-2 p-3 border rounded w-full"
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <option value="general">Scanner On to Scanner Off</option>
          <option value="eight">Workday from 8am to 8pm</option>
        </select>
        <button
          onClick={fetchData}
          className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Fetch Data
        </button>
      </header>
      <div className="p-3">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : averageEff !== null ? (
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Percentage of Day Scanning: {averageEff}%
          </div>
        ) : (
          <div>No data available for the selected criteria.</div>
        )}
      </div>
      {dataFetched && chartData && (
        <div className="p-5">
          <DoughnutChart
            key={JSON.stringify(chartData)}
            centerNumber={averageEff} // Use averageEff here
            response={false}
            data={chartData}
            width={389}
            height={260}
          />
        </div>
      )}
    </div>
  );
}

export default CycleCard;
