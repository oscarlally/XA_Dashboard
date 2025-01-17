import React, { useState, useEffect, useCallback } from 'react';
import DateConverterSQL from '../../extrafuncs/DateConverterSQL';
import { useNavigate } from 'react-router-dom';
import HorizBarChart from '../../charts/BarChart01';
import { tailwindConfig, hexToRGB } from '../../utils/Utils';
import axios from 'axios';

function AnatomyCard({ selectedDates }) {
  const [chartData, setChartData] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState('smrvid');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const navigate = useNavigate();

  const startDate = DateConverterSQL(selectedDates[0]);
  const endDate = DateConverterSQL(selectedDates[1]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!endDate || !selectedSchema) {
        setChartData(null);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      if (decodedToken.exp < currentTime) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://10.189.108.198:3000/api/getAnatomyTimesWithNos',
        {
          selectedSchema,
          startDate,
          endDate,
          cacheBuster: new Date().getTime(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let protocolsData = response.data.data;

      // Filter out protocols that contain numbers
      protocolsData = protocolsData.filter(item => !/\d/.test(item.protocol));

      console.log('Filtered Protocols', protocolsData);

      if (protocolsData.length > 0) {
        const labelsPre1 = protocolsData.map(item => item.protocol);
        const labelsPre2 = protocolsData.map(item => item.dataPoints);
        const data = protocolsData.map(item => item.averageTime);

        const labels = [];
        for (let i = 0; i < labelsPre1.length; i++) {
          labels.push(`${labelsPre1[i]}:  ${labelsPre2[i]} scan(s)`);
        }
        

        setChartData({
          labels,
          datasets: [
            {
              label: 'Average Times',
              data,
              backgroundColor: tailwindConfig().theme.colors.green[500],
              hoverBackgroundColor: tailwindConfig().theme.colors.green[700],
              barPercentage: 0.66,
              categoryPercentage: 0.66,
            },
          ],
        });

        setDataFetched(true);
      } else {
        setChartData(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('No data for these parameters.');
      setChartData(null);
    } finally {
      setIsLoading(false);
    }
  }, [endDate, selectedSchema, navigate]);

  const handleTableChange = (e) => {
    if (e.target.name === 'schema') {
      setSelectedSchema(e.target.value);
    }
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Scan Length by Date and Anatomy</h2>
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
        ) : chartData ? (
          <div className="p-5">
            <HorizBarChart data={chartData} width={389} height={300} />
          </div>
        ) : (
          <div>No data available for the selected criteria.</div>
        )}

      </div>
    </div>
  );
}

export default AnatomyCard;
