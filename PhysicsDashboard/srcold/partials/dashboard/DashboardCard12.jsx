import React, { useState, useEffect, useCallback } from 'react';
import DoughnutChart from '../../charts/DoughnutChart';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DashboardCard12({ selectedDates, scannerName, bodyPart }) {
  const [chartData, setChartData] = useState(null);
  const [centreNo, setCentreNo] = useState(null);
  const [selectedTable, setSelectedTable] = useState('daily_data');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const endDate = '2024-07-24'; // Consider making this dynamic

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!endDate || !selectedTable) {
        setChartData(null);
        setCentreNo(null);
        return;
      }

      const apiUrl = 'http://localhost:3000/api/getData';
      const token = localStorage.getItem('token');

      console.log(`Fetching data from table: ${selectedTable}`);

      const response = await axios.post(
        apiUrl,
        {
          query: `
            SELECT entry_date, body_part, number1, number2, number3, number4
            FROM ${selectedTable}
            WHERE entry_date <= $1 AND body_part = $2
            ORDER BY entry_date DESC, body_part
            LIMIT 1
          `,
          params: [endDate, bodyPart]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const result = response.data;

      if (result.data.length > 0) {
        const data = result.data[0];
        const total = data.number1 + data.number2 + data.number3 + data.number4;
        setCentreNo(`Total On: ${total}`);

        setChartData({
          labels: ['Number 1', 'Number 2', 'Number 3', 'Number 4'],
          datasets: [
            {
              label: 'Values',
              data: [data.number1, data.number2, data.number3, data.number4],
              backgroundColor: ['green', 'blue', 'purple', 'red'],
              hoverBackgroundColor: ['darkgreen', 'darkblue', 'darkpurple', 'darkred'],
              borderWidth: 0,
            },
          ],
        });
      } else {
        setChartData(null);
        setCentreNo(null);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [endDate, selectedTable, bodyPart]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ... (keep the logout logic useEffect as it was)

  const handleTableChange = (e) => {
    setSelectedTable(e.target.value);
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
      <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">Anatomy</h2>
        <select
          value={selectedTable}
          onChange={handleTableChange}
          className="mt-2 p-2 border rounded"
        >
          <option value="other_table_1">Other Table 1</option>
          <option value="daily_data">Anatomy Data</option>
          <option value="other_table_2">Other Table 2</option>
        </select>
      </header>
      <div className="p-3">
        {isLoading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : chartData ? (
          <DoughnutChart key={JSON.stringify(chartData)} centerNumber={centreNo} data={chartData} width={389} height={260} />
        ) : (
          <div>No data available for the selected table.</div>
        )}
      </div>
    </div>
  );
}

export default DashboardCard12;
