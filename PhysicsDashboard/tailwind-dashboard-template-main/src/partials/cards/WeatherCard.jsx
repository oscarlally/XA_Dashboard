import React, { useState, useEffect, useCallback } from 'react';
import DateConverterSQL from '../../extrafuncs/DateConverterSQL';
import DateRange from '../../extrafuncs/DateRange';
import { useNavigate } from 'react-router-dom';
import LineChart from '../../charts/LineChart';
import AverageData from '../../extrafuncs/AverageData';
import { tailwindConfig, hexToRGB } from '../../utils/Utils';
import axios from 'axios';

function WeatherCard({ selectedDates }) {
  const [averageTemp, setAverageTemp] = useState(null);
  const [averageHum, setAverageHum] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState('smrvid');
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
        setAverageTemp(null);
        setAverageHum(null);
        setChartData(null);
        return;
      }

      const token = localStorage.getItem('token'); // Or however you store the token

      if (!token) {
        setError('Authentication token is missing.');
        return;
      }

      const tempResults = [];
      const humResults = [];

      for (let i = 0; i < datesArray.length; i++) {
        const queryDate = String(datesArray[i]);
        console.log('hello', queryDate);

        const response_temp = await axios.post(
          'http://10.189.108.198:3000/api/getCustomQuery',
          {
            selectedSchema,
            queryDate,
            columnName: 'temperature', // The specific column you want to query
            tableName: 'weather', // The specific table you want to query
            cacheBuster: new Date().getTime(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }
        );

        const response_hum = await axios.post(
          'http://10.189.108.198:3000/api/getCustomQuery',
          {
            selectedSchema,
            queryDate,
            columnName: 'humidity', // The specific column you want to query
            tableName: 'weather', // The specific table you want to query
            cacheBuster: new Date().getTime(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }
        );


        const singleResultTemp = response_temp.data;
        const singleResultHum = response_hum.data;
        const tempStr = singleResultTemp.data.outputParam;
        const humStr = singleResultHum.data.outputParam;
        tempResults.push(tempStr);
        humResults.push(humStr);
      }

      const sumTemp = tempResults.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      const averagePreTemp = sumTemp / tempResults.length;
      const averageTemp = Math.round(averagePreTemp * 10) / 10;

      const sumHum = humResults.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      const averagePreHum = sumHum / humResults.length;
      const averageHum = Math.round(averagePreHum * 10) / 10;

      console.log('Data');
      console.log(averageHum);
      console.log(averageTemp);
      console.log(tempResults);
      console.log(humResults);

      if (averageTemp && averageTemp !== 0 && averageHum && averageHum !== 0) {
        setAverageTemp(averageTemp)
        setAverageHum(averageHum);
        setChartData({
          labels: datesArray,
          datasets: [
            {
              label: 'Temperature',
              data: tempResults,
              fill: true,
              backgroundColor: 'rgba(255, 0, 0, 0.08)',
              borderColor: 'rgb(255, 0, 0)',
              borderWidth: 2,
              tension: 0,
              pointRadius: 0,
              pointHoverRadius: 3,
              pointBackgroundColor: 'rgb(255, 0, 0)',
              pointHoverBackgroundColor: 'rgb(255, 0, 0)',
              pointBorderWidth: 0,
              pointHoverBorderWidth: 0,
              clip: 20,
            },
            {
              label: 'Humidity',
              data: humResults,
              borderColor: 'rgb(0, 0, 255)',
              borderWidth: 2,
              tension: 0,
              pointRadius: 0,
              pointHoverRadius: 3,
              pointBackgroundColor: 'rgb(0, 0, 255)',
              pointHoverBackgroundColor: 'rgb(0, 0, 255)',
              pointBorderWidth: 0,
              pointHoverBorderWidth: 0,
              clip: 20,
            },
          ],
        });

        setDataFetched(true);
      } else {
        setAverageTemp(null);
        setAverageHum(null);
        setChartData(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('No data for these parameters.');
      setChartData(null);
    } finally {
      setIsLoading(false);
    }
  }, [endDate, selectedSchema, datesArray]);

  const handleTableChange = (e) => {
    setSelectedSchema(e.target.value);
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Scanner Conditions</h2>
        <select
          name="schema"
          value={selectedSchema}
          onChange={handleTableChange}
          className="mt-2 p-3 border rounded w-full"
          style={{ width: '100%', marginBottom: '10px' }}
        >
          <option value="smrvid">SMRVID</option>
          <option value="gmri3">GMRI3</option>
          <option value="gmri4">GMRI4</option>
          <option value="emri1">EMRI</option>
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
        ) : averageTemp !== null ? (
          <div className="text-red-500">{error}</div>
        ) : averageHum !== null ? (
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Temperature: {averageTemp} | Humidity: {averageHum}
          </div>
        ) : (
          <div>No data available for the selected criteria.</div>
        )}
      </div>
      {dataFetched && chartData && (
        <div className="p-5">
          <LineChart data={chartData} width={389} height={200} />
        </div>
      )}
    </div>
  );
}

export default WeatherCard;
