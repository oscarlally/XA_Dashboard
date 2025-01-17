import React, { useState, useCallback, useEffect } from 'react';
import DateConverterSQL from '../../extrafuncs/DateConverterSQL';
import ConvertToTime from '../../extrafuncs/ConvertToTime';
import UtilPrep from '../../extrafuncs/UtilPrep';
import axios from 'axios';
import SidebarchartUtils from '../../charts/SidebarchartUtils';

function UtilCard({ selectedDates }) {
  const [data, setData] = useState(null);
  const [timeEnds, setTimeEnds] = useState([]); // State for the time ends
  const [selectedSchema, setSelectedSchema] = useState('smrvid');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [protocolList, setProtocolList] = useState(null);
  const [chartData, setChartData] = useState([]); // State for the chart data

  const queryDate = DateConverterSQL(selectedDates[1]); // Using the end date

  const startDate = DateConverterSQL(selectedDates[0]);
  const endDate = DateConverterSQL(selectedDates[1]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!queryDate || !selectedSchema) {
        setData(null);
        return;
      }

      const token = localStorage.getItem('token');

      if (!token) {
        setError('Authentication token is missing.');
        return;
      }

      const response = await axios.post(
        'http://10.189.108.198:3000/api/getCustomQuerySingle',
        {
          selectedSchema,
          queryDate,
          columnName: 'times', 
          tableName: 'timings',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const anat = await axios.get('http://10.189.108.198:3000/api/getAnatomyOptionsDate', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          selectedSchema,
          startDate,
          endDate,  
        },
      });

      const protocolList = anat.data;
      setProtocolList(protocolList);
      console.log('Protocols', protocolList)

      const dataPre = response.data;
      const data2D = dataPre.data.outputParams;
      const timePointsArray = UtilPrep(data2D); // Assuming this returns an array of arrays

      if (response.data.success && timePointsArray.length > 0) {
        setData(timePointsArray);

        const allCharts = [];
        const allTimeEnds = [];

        timePointsArray.forEach((timePoints, index) => {
          console.log('Arrays', timePoints)
          let scan, breaks, length, timeEnds;

          if (timePoints.length >= 4) {
            if (index < timePointsArray.length - 1) {
              scan = 60 * (parseFloat(timePoints[2]) - parseFloat(timePoints[1]));
              breaks = 60 * (parseFloat(timePoints[4]) - parseFloat(timePoints[2]));
              length = scan + breaks;
              timeEnds = [
                ConvertToTime(parseFloat(timePoints[1])),
                ConvertToTime(parseFloat(timePoints[2])),
                ConvertToTime(parseFloat(timePoints[4])),
              ];
            } else {
              scan = 60 * (parseFloat(timePoints[2]) - parseFloat(timePoints[1]));
              breaks = 0; // Ensure breaks is defined as 0 for the last element
              length = scan + breaks;
              timeEnds = [
                ConvertToTime(parseFloat(timePoints[1])),
                ConvertToTime(parseFloat(timePoints[2])),
                ConvertToTime(parseFloat(timePoints[2])),
              ];
            }

            allTimeEnds.push(timeEnds);

            // Conditionally create the dataset
            const chartData = {
              labels: [`Scan ${index + 1}`], // Label each graph uniquely
              datasets: breaks > 0 ? [ // If there's a break, show both datasets
                {
                  label: 'Scanning',
                  data: [scan],
                  backgroundColor: '#00FF00', // Green color
                },
                {
                  label: 'Break',
                  data: [breaks],
                  backgroundColor: '#FF0000', // Red color
                },
              ] : [ // If there's no break, show only the Scanning dataset
                {
                  label: 'Scanning',
                  data: [length], // Total length
                  backgroundColor: '#00FF00', // Green color
                },
              ],
            };

            allCharts.push({ chartData, length, timeEnds });
          }
        });

        setChartData(allCharts);
        setTimeEnds(allTimeEnds);
      } else {
        setData(null);
        setChartData([]);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('No data for these parameters.');
      setData(null);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, [queryDate, selectedSchema]);


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
        ) : data ? (
          <div>
            {chartData.map((chart, index) => (
              <div key={index} className="mb-5">
                <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {protocolList[index]} from {chart.timeEnds[0]} to {chart.timeEnds[2]}
                </div>
                <SidebarchartUtils
                  data={chart.chartData}
                  times={chart.timeEnds}
                  length={chart.length}
                  height={100} // Adjust as needed
                  subtitle={`Time Segments ${index + 1}`}
                  time={60} // Adjust as needed
                />
              </div>
            ))}
          </div>
        ) : (
          <div>No data available for the selected criteria.</div>
        )}
      </div>
    </div>
  );
}

export default UtilCard;
