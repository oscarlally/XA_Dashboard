import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DateConverterSQL from '../../extrafuncs/DateConverterSQL';
import DateRange from '../../extrafuncs/DateRange';
import { useNavigate } from 'react-router-dom';
import AnatomyLine from '../../charts/AnatomyLine';
import { tailwindConfig, hexToRGB } from '../../utils/Utils';
import axios from 'axios';

function HomeCard({ selectedDates }) {
  const [averageTime, setAverageTime] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [otherInfo, setOtherInfo] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState('smrvid');
  const [selectedAnatomy, setSelectedAnatomy] = useState('');
  const [anatomyOptions, setAnatomyOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const navigate = useNavigate();

  // Memoize startDate and endDate to prevent unnecessary re-renders
  const startDate = useMemo(() => DateConverterSQL(selectedDates[0]), [selectedDates]);
  const endDate = useMemo(() => DateConverterSQL(selectedDates[1]), [selectedDates]);
  const queryDate = useMemo(() => DateConverterSQL(selectedDates[1]), [selectedDates]);
  const datesArray = useMemo(() => [...new Set(DateRange(startDate, endDate, 2))], [startDate, endDate]);

  useEffect(() => {
    const fetchAnatomyOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://10.189.108.198:3000/api/getAnatomyOptionsDateDistinct', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            selectedSchema,
            startDate,
            endDate,
          },
        });

        setAnatomyOptions(response.data);
        if (response.data.length > 0) {
          setSelectedAnatomy(response.data[0]); // Set the first anatomy option as default
        }
      } catch (error) {
        console.error('Error fetching anatomy options:', error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      }
    };

    if (startDate && endDate) {
      fetchAnatomyOptions(); // Trigger only when dates change
    }
  }, [startDate, endDate, selectedSchema, navigate]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!selectedSchema || !selectedAnatomy || !endDate) {
        console.log('One or more required fields are missing.');
        setAverageTime(null);
        setChartData(null);
        setIsLoading(false);
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
        'http://10.189.108.198:3000/api/getAnatomyData',
        {
          selectedSchema,
          selectedAnatomy,
          queryDate,
          cacheBuster: new Date().getTime(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const additional = await axios.post(
        'http://10.189.108.198:3000/api/getChangeData',
        {
          selectedSchema,
          selectedAnatomy,
          queryDate,
          cacheBuster: new Date().getTime(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const results = response.data.data.scanLengths;
      const changes = additional.data.data.otherInformation;
      setOtherInfo(changes);

      const sum = results.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      const avg = Math.round((sum / results.length) * 10) / 10;

      const labels = [];
      for (let i = 0; i < results.length; i++) {
        labels.push(`Scan ${i+1}`);
      }

      if (avg && avg !== 0) {
        setAverageTime(avg);
        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Scan Lengths',
              data: results,
              fill: true,
              backgroundColor: `rgba(${hexToRGB(tailwindConfig().theme.colors.blue[500])}, 0.08)`,
              borderColor: tailwindConfig().theme.colors.blue[500],
              borderWidth: 2,
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointBackgroundColor: tailwindConfig().theme.colors.blue[500],
              pointHoverBackgroundColor: tailwindConfig().theme.colors.blue[500],
              pointBorderWidth: 2,
              pointHoverBorderWidth: 3,
            },
          ],
        });

        setDataFetched(true);
      } else {
        setAverageTime(null);
        setChartData(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('No data for these parameters.');
      setChartData(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSchema, selectedAnatomy, queryDate, endDate, navigate, datesArray]);

  const handleTableChange = (e) => {
    if (e.target.name === 'schema') {
      setSelectedSchema(e.target.value);
    } else if (e.target.name === 'anatomy') {
      setSelectedAnatomy(e.target.value);
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
        <select
          name="anatomy"
          value={selectedAnatomy}
          onChange={handleTableChange}
          className="mt-2 p-3 border rounded w-full"
          style={{ width: '100%', marginBottom: '10px' }}
        >
          {anatomyOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
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
        ) : averageTime !== null ? (
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Average Time for {selectedAnatomy}:    {averageTime} minutes
          </div>
        ) : (
          <div>No data available for the selected criteria.</div>
        )}
      </div>
      {dataFetched && chartData && (
        <div className="p-5">
          <AnatomyLine data={chartData} width={389} height={256} />
        </div>
      )}

      {dataFetched && averageTime && (
        <div className="p-5">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Deviations Table</h3>
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amended Items</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {chartData.labels.map((label, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{label}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{otherInfo[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default HomeCard;



// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import DateConverterSQL from '../../extrafuncs/DateConverterSQL';
// import DateRange from '../../extrafuncs/DateRange';
// import { useNavigate } from 'react-router-dom';
// import AnatomyLine from '../../charts/AnatomyLine';
// import { tailwindConfig, hexToRGB } from '../../utils/Utils';
// import axios from 'axios';

// function HomeCard({ selectedDates }) {
//   const [averageTime, setAverageTime] = useState(null);
//   const [chartData, setChartData] = useState(null);
//   const [otherInfo, setOtherInfo] = useState(null);
//   const [otherInfo2, setOtherInfo2] = useState(null);
//   const [selectedSchema, setSelectedSchema] = useState('smrvid');
//   const [selectedSchema2, setSelectedSchema2] = useState('emri');
//   const [selectedAnatomy, setSelectedAnatomy] = useState('');
//   const [anatomyOptions, setAnatomyOptions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [dataFetched, setDataFetched] = useState(false);
//   const navigate = useNavigate();

//   // Memoize startDate and endDate to prevent unnecessary re-renders
//   const startDate = useMemo(() => DateConverterSQL(selectedDates[0]), [selectedDates]);
//   const endDate = useMemo(() => DateConverterSQL(selectedDates[1]), [selectedDates]);
//   const queryDate = useMemo(() => DateConverterSQL(selectedDates[1]), [selectedDates]);
//   const datesArray = useMemo(() => [...new Set(DateRange(startDate, endDate, 2))], [startDate, endDate]);

//   useEffect(() => {
//     const fetchAnatomyOptions = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           navigate('/login');
//           return;
//         }

//         const response = await axios.get('http://localhost:3000/api/getAnatomyOptionsDateDistinct', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params: {
//             selectedSchema,
//             startDate,
//             endDate,
//           },
//         });

//         setAnatomyOptions(response.data);
//         if (response.data.length > 0) {
//           setSelectedAnatomy(response.data[0]); // Set the first anatomy option as default
//         }
//       } catch (error) {
//         console.error('Error fetching anatomy options:', error);
//         if (error.response && error.response.status === 401) {
//           navigate('/login');
//         }
//       }
//     };

//     if (startDate && endDate) {
//       fetchAnatomyOptions(); // Trigger only when dates change
//     }
//   }, [startDate, endDate, selectedSchema, navigate]);

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       if (!selectedSchema || !selectedSchema2 || !selectedAnatomy || !endDate) {
//         console.log('One or more required fields are missing.');
//         setAverageTime(null);
//         setChartData(null);
//         setIsLoading(false);
//         return;
//       }

//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       const decodedToken = JSON.parse(atob(token.split('.')[1]));
//       const currentTime = Date.now() / 1000;

//       if (decodedToken.exp < currentTime) {
//         navigate('/login');
//         return;
//       }

//       const response = await axios.post(
//         'http://localhost:3000/api/getAnatomyData',
//         {
//           selectedSchema,
//           selectedAnatomy,
//           queryDate,
//           cacheBuster: new Date().getTime(),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const response2 = await axios.post(
//         'http://localhost:3000/api/getAnatomyData',
//         {
//           selectedSchema2,
//           selectedAnatomy,
//           queryDate,
//           cacheBuster: new Date().getTime(),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const additional = await axios.post(
//         'http://localhost:3000/api/getChangeData',
//         {
//           selectedSchema,
//           selectedAnatomy,
//           queryDate,
//           cacheBuster: new Date().getTime(),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const additional2 = await axios.post(
//         'http://localhost:3000/api/getChangeData',
//         {
//           selectedSchema2,
//           selectedAnatomy,
//           queryDate,
//           cacheBuster: new Date().getTime(),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const results = response.data.data.scanLengths;
//       const changes = additional.data.data.otherInformation;
//       const results2 = response2.data.data.scanLengths;
//       const changes2 = additional2.data.data.otherInformation;
//       setOtherInfo(changes);
//       setOtherInfo2(changes2);

//       const sum = results.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
//       const avg = Math.round((sum / results.length) * 10) / 10;

//       const labels = [];
//       for (let i = 0; i < results.length; i++) {
//         labels.push(`Scan ${i+1}`);
//       }

//       if (avg && avg !== 0) {
//         setAverageTime(avg);
//         setChartData({
//           labels: labels,
//           datasets: [
//             {
//               label: 'Scan Lengths',
//               data: results,
//               fill: true,
//               backgroundColor: `rgba(${hexToRGB(tailwindConfig().theme.colors.blue[500])}, 0.08)`,
//               borderColor: tailwindConfig().theme.colors.blue[500],
//               borderWidth: 2,
//               tension: 0.3,
//               pointRadius: 3,
//               pointHoverRadius: 5,
//               pointBackgroundColor: tailwindConfig().theme.colors.blue[500],
//               pointHoverBackgroundColor: tailwindConfig().theme.colors.blue[500],
//               pointBorderWidth: 2,
//               pointHoverBorderWidth: 3,
//             },
//             {
//               label: 'Scan Lengths',
//               data: results2,
//               fill: true,
//               backgroundColor: `rgba(${hexToRGB(tailwindConfig().theme.colors.red[500])}, 0.08)`,
//               borderColor: tailwindConfig().theme.colors.red[500],
//               borderWidth: 2,
//               tension: 0.3,
//               pointRadius: 3,
//               pointHoverRadius: 5,
//               pointBackgroundColor: tailwindConfig().theme.colors.red[500],
//               pointHoverBackgroundColor: tailwindConfig().theme.colors.red[500],
//               pointBorderWidth: 2,
//               pointHoverBorderWidth: 3,
//             },
//           ],
//         });

//         setDataFetched(true);
//       } else {
//         setAverageTime(null);
//         setChartData(null);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setError('No data for these parameters.');
//       setChartData(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedSchema, selectedAnatomy, queryDate, endDate, navigate, datesArray]);

//   const handleTableChange = (e) => {
//     if (e.target.name === 'schema') {
//       setSelectedSchema(e.target.value);
//     } else if (e.target.name === 'anatomy') {
//       setSelectedAnatomy(e.target.value);
//     }
//   };

//   return (
//     <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
//       <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
//         <h2 className="font-semibold text-slate-800 dark:text-slate-100">Scan Length by Date and Anatomy</h2>
//         <select
//           name="schema"
//           value={selectedSchema}
//           onChange={handleTableChange}
//           className="mt-2 p-3 border rounded w-full"
//           style={{ width: '100%', marginBottom: '10px' }}
//         >
//           <option value="smrvid">SMRVID</option>
//           <option value="gmri3">GMRI3</option>
//           <option value="gmri4">GMRI4</option>
//           <option value="emri">EMRI</option>
//         </select>
//         <select
//           name="second_schema"
//           value={selectedSchema2}
//           onChange={handleTableChange}
//           className="mt-2 p-3 border rounded w-full"
//           style={{ width: '100%', marginBottom: '10px' }}
//         >
//           <option value="smrvid">SMRVID</option>
//           <option value="gmri3">GMRI3</option>
//           <option value="gmri4">GMRI4</option>
//           <option value="emri">EMRI</option>
//         </select>
//         <select
//           name="anatomy"
//           value={selectedAnatomy}
//           onChange={handleTableChange}
//           className="mt-2 p-3 border rounded w-full"
//           style={{ width: '100%', marginBottom: '10px' }}
//         >
//           {anatomyOptions.map((option, index) => (
//             <option key={index} value={option}>
//               {option}
//             </option>
//           ))}
//         </select>
//         <button
//           onClick={fetchData}
//           className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//         >
//           Fetch Data
//         </button>
//       </header>
//       <div className="p-3">
//         {isLoading ? (
//           <div>Loading...</div>
//         ) : error ? (
//           <div className="text-red-500">{error}</div>
//         ) : averageTime !== null ? (
//           <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
//             Average Time for {selectedAnatomy}:    {averageTime} minutes
//           </div>
//         ) : (
//           <div>No data available for the selected criteria.</div>
//         )}
//       </div>
//       {dataFetched && chartData && (
//         <div className="p-5">
//           <AnatomyLine data={chartData} width={389} height={256} />
//         </div>
//       )}

//       {dataFetched && averageTime && (
//         <div className="p-5">
//           <h3 className="font-semibold text-slate-800 dark:text-slate-100">Deviations Table</h3>
//           <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
//             <thead>
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scan</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amended Items</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
//               {chartData.labels.map((label, index) => (
//                 <tr key={index}>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{label}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{otherInfo[index]}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }

// export default HomeCard;






// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import DateConverterSQL from '../../extrafuncs/DateConverterSQL';
// import DateRange from '../../extrafuncs/DateRange';
// import { useNavigate } from 'react-router-dom';
// import AnatomyLine from '../../charts/AnatomyLine';
// import { tailwindConfig, hexToRGB } from '../../utils/Utils';
// import axios from 'axios';

// function HomeCard({ selectedDates }) {
//   const [averageTime, setAverageTime] = useState(null);
//   const [chartData, setChartData] = useState(null);
//   const [selectedSchema, setSelectedSchema] = useState('smrvid');
//   const [selectedAnatomy, setSelectedAnatomy] = useState('');
//   const [anatomyOptions, setAnatomyOptions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [dataFetched, setDataFetched] = useState(false);
//   const navigate = useNavigate();

//   // Memoize startDate and endDate to prevent unnecessary re-renders
//   const startDate = useMemo(() => DateConverterSQL(selectedDates[0]), [selectedDates]);
//   const endDate = useMemo(() => DateConverterSQL(selectedDates[1]), [selectedDates]);
//   const queryDate = useMemo(() => DateConverterSQL(selectedDates[1]), [selectedDates]);
//   const datesArray = useMemo(() => [...new Set(DateRange(startDate, endDate, 2))], [startDate, endDate]);

//   useEffect(() => {
//     const fetchAnatomyOptions = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           navigate('/login');
//           return;
//         }

//         const response = await axios.get('http://localhost:3000/api/getAnatomyOptionsDateDistinct', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params: {
//             selectedSchema,
//             startDate,
//             endDate,
//           },
//         });

//         setAnatomyOptions(response.data);
//         if (response.data.length > 0) {
//           setSelectedAnatomy(response.data[0]); // Set the first anatomy option as default
//         }
//       } catch (error) {
//         console.error('Error fetching anatomy options:', error);
//         if (error.response && error.response.status === 401) {
//           navigate('/login');
//         }
//       }
//     };

//     if (startDate && endDate) {
//       fetchAnatomyOptions(); // Trigger only when dates change
//     }
//   }, [startDate, endDate, selectedSchema, navigate]);

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       if (!selectedSchema || !selectedAnatomy || !endDate) {
//         console.log('One or more required fields are missing.');
//         setAverageTime(null);
//         setChartData(null);
//         setIsLoading(false);
//         return;
//       }

//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       const decodedToken = JSON.parse(atob(token.split('.')[1]));
//       const currentTime = Date.now() / 1000;

//       if (decodedToken.exp < currentTime) {
//         navigate('/login');
//         return;
//       }

//       const response = await axios.post(
//         'http://localhost:3000/api/getAnatomyData',
//         {
//           selectedSchema,
//           selectedAnatomy,
//           queryDate,
//           cacheBuster: new Date().getTime(),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const results = response.data.data.scanLengths;
//       console.log('hello', results)
//       const sum = results.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
//       const avg = Math.round((sum / results.length) * 10) / 10;


//       const labels = [];
//       for (let i = 0; i < results.length; i++) {
//         labels.push(`Scan ${i+1}`);
//       }

//       console.log('Labels', labels)

//       if (avg && avg !== 0) {
//         setAverageTime(avg);
//         setChartData({
//           labels: labels,
//           datasets: [
//             {
//               label: 'Scan Lengths Per day',
//               data: results,
//               fill: true,
//               backgroundColor: `rgba(${hexToRGB(tailwindConfig().theme.colors.blue[500])}, 0.08)`,
//               borderColor: tailwindConfig().theme.colors.blue[500],
//               borderWidth: 2,
//               tension: 0.3,
//               pointRadius: 3,
//               pointHoverRadius: 5,
//               pointBackgroundColor: tailwindConfig().theme.colors.blue[500],
//               pointHoverBackgroundColor: tailwindConfig().theme.colors.blue[500],
//               pointBorderWidth: 2,
//               pointHoverBorderWidth: 3,
//             },
//           ],
//         });

//         setDataFetched(true);
//       } else {
//         setAverageTime(null);
//         setChartData(null);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setError('No data for these parameters.');
//       setChartData(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedSchema, selectedAnatomy, queryDate, endDate, navigate, datesArray]);

//   const handleTableChange = (e) => {
//     if (e.target.name === 'schema') {
//       setSelectedSchema(e.target.value);
//     } else if (e.target.name === 'anatomy') {
//       setSelectedAnatomy(e.target.value);
//     }
//   };

//   return (
//     <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
//       <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
//         <h2 className="font-semibold text-slate-800 dark:text-slate-100">Scan Length by Date and Anatomy</h2>
//         <select
//           name="schema"
//           value={selectedSchema}
//           onChange={handleTableChange}
//           className="mt-2 p-3 border rounded w-full"
//           style={{ width: '100%', marginBottom: '10px' }}
//         >
//           <option value="smrvid">SMRVID</option>
//           <option value="gmri3">GMRI3</option>
//           <option value="gmri4">GMRI4</option>
//           <option value="emri">EMRI</option>
//         </select>
//         <select
//           name="anatomy"
//           value={selectedAnatomy}
//           onChange={handleTableChange}
//           className="mt-2 p-3 border rounded w-full"
//           style={{ width: '100%', marginBottom: '10px' }}
//         >
//           {anatomyOptions.map((option, index) => (
//             <option key={index} value={option}>
//               {option}
//             </option>
//           ))}
//         </select>
//         <button
//           onClick={fetchData}
//           className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//         >
//           Fetch Data
//         </button>
//       </header>
//       <div className="p-3">
//         {isLoading ? (
//           <div>Loading...</div>
//         ) : error ? (
//           <div className="text-red-500">{error}</div>
//         ) : averageTime !== null ? (
//           <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
//             Average Time: {averageTime} minutes
//           </div>
//         ) : (
//           <div>No data available for the selected criteria.</div>
//         )}
//       </div>
//       {dataFetched && chartData && (
//         <div className="p-5">
//           <AnatomyLine data={chartData} width={389} height={256} />
//         </div>
//       )}
//     </div>
//   );
// }

// export default HomeCard;







// import React, { useState, useEffect, useCallback } from 'react';
// import DateConverterSQL from '../../extrafuncs/DateConverterSQL';
// import DateRange from '../../extrafuncs/DateRange';
// import { useNavigate } from 'react-router-dom';
// import LineAnatomy from '../../charts/LineAnatomy';
// import { tailwindConfig, hexToRGB } from '../../utils/Utils';
// import axios from 'axios';

// function HomeCard({ selectedDates }) {
//   const [averageTime, setAverageTime] = useState(null);
//   const [chartData, setChartData] = useState(null);
//   const [selectedSchema, setSelectedSchema] = useState('smrvid');
//   const [selectedAnatomy, setSelectedAnatomy] = useState('');
//   const [anatomyOptions, setAnatomyOptions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [dataFetched, setDataFetched] = useState(false);
//   const navigate = useNavigate();

//   // Convert selectedDates to SQL format
//   const startDate = DateConverterSQL(selectedDates[0]);
//   const endDate = DateConverterSQL(selectedDates[1]);
//   const queryDate = DateConverterSQL(selectedDates[1]);

//   const datesArrayPre = DateRange(startDate, endDate, 2);
//   const datesArray = [...new Set(datesArrayPre)];

//   useEffect(() => {
//     // Fetch anatomy options only on page load or date change
//     const fetchAnatomyOptions = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           navigate('/login');
//           return;
//         }

//         const response = await axios.get('http://localhost:3000/api/getAnatomyOptionsDateDistinct', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params: {
//             selectedSchema,
//             startDate,
//             endDate,
//           },
//         });

//         setAnatomyOptions(response.data);
//         if (response.data.length > 0) {
//           setSelectedAnatomy(response.data[0]); // Set the first anatomy option as default
//         }
//       } catch (error) {
//         console.error('Error fetching anatomy options:', error);
//         if (error.response && error.response.status === 401) {
//           navigate('/login');
//         }
//       }
//     };

//     if (startDate && endDate) {
//       fetchAnatomyOptions(); // Trigger only when dates change
//     }
//   }, [startDate, endDate, navigate]); // Trigger only when startDate or endDate changes

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       if (!selectedSchema || !selectedAnatomy || !endDate) {
//         console.log('One or more required fields are missing.');
//         setAverageTime(null);
//         setChartData(null);
//         setIsLoading(false);
//         return;
//       }

//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       const decodedToken = JSON.parse(atob(token.split('.')[1]));
//       const currentTime = Date.now() / 1000;

//       if (decodedToken.exp < currentTime) {
//         navigate('/login');
//         return;
//       }

//       const response = await axios.post(
//         'http://localhost:3000/api/getAnatomyData',
//         {
//           selectedSchema,
//           selectedAnatomy,
//           queryDate,
//           cacheBuster: new Date().getTime(),
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const results = response.data.data.scanLengths;

//       const sum = results.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
//       const avgPre =  sum / results.length;
//       const avg = Math.round(avgPre * 10) / 10

//       console.log('Hello', results)

//       if (avg && avg !== 0) {
//         setAverageTime(avg);
//         setChartData({
//           labels: datesArray,
//           datasets: [
//             {
//               label: 'Average Time',
//               data: results,
//               fill: true,
//               backgroundColor: `rgba(${hexToRGB(tailwindConfig().theme.colors.blue[500])}, 0.08)`,
//               borderColor: tailwindConfig().theme.colors.blue[500],
//               borderWidth: 2,
//               tension: 0.3,
//               pointRadius: 3,
//               pointHoverRadius: 5,
//               pointBackgroundColor: tailwindConfig().theme.colors.blue[500],
//               pointHoverBackgroundColor: tailwindConfig().theme.colors.blue[500],
//               pointBorderWidth: 2,
//               pointHoverBorderWidth: 3,
//             },
//           ],
//         });

//         setDataFetched(true);
//       } else {
//         setAverageTime(null);
//         setChartData(null);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setError('No data for these parameters.');
//       setChartData(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedSchema, selectedAnatomy, endDate, navigate, datesArray]);

//   const handleTableChange = (e) => {
//     if (e.target.name === 'schema') {
//       setSelectedSchema(e.target.value);
//     } else if (e.target.name === 'anatomy') {
//       setSelectedAnatomy(e.target.value);
//     }
//   };

//   return (
//     <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
//       <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
//         <h2 className="font-semibold text-slate-800 dark:text-slate-100">Scan Length by Date and Anatomy</h2>
//         <select
//           name="schema"
//           value={selectedSchema}
//           onChange={handleTableChange}
//           className="mt-2 p-3 border rounded w-full"
//           style={{ width: '100%', marginBottom: '10px' }}
//         >
//           <option value="smrvid">SMRVID</option>
//           <option value="gmri3">GMRI3</option>
//           <option value="gmri4">GMRI4</option>
//           <option value="emri">EMRI</option>
//         </select>
//         <select
//           name="anatomy"
//           value={selectedAnatomy}
//           onChange={handleTableChange}
//           className="mt-2 p-3 border rounded w-full"
//           style={{ width: '100%', marginBottom: '10px' }}
//         >
//           {anatomyOptions.map((option, index) => (
//             <option key={index} value={option}>
//               {option}
//             </option>
//           ))}
//         </select>
//         <button
//           onClick={fetchData}
//           className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//         >
//           Fetch Data
//         </button>
//       </header>
//       <div className="p-3">
//         {isLoading ? (
//           <div>Loading...</div>
//         ) : error ? (
//           <div className="text-red-500">{error}</div>
//         ) : averageTime !== null ? (
//           <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
//             Average Time: {averageTime} minutes
//           </div>
//         ) : (
//           <div>No data available for the selected criteria.</div>
//         )}
//       </div>
//       {dataFetched && chartData && (
//         <div className="p-5">
//           <LineAnatomy data={chartData} width={389} height={256} />
//         </div>
//       )}
//     </div>
//   );
// }

// export default HomeCard;




// import React, { useState, useEffect, useCallback } from 'react';
// import DateConverterSQL from '../../extrafuncs/DateConverterSQL';
// import DateRange from '../../extrafuncs/DateRange';
// import { useNavigate } from 'react-router-dom';
// import LineAnatomy from '../../charts/LineAnatomy';
// import { tailwindConfig, hexToRGB } from '../../utils/Utils';
// import axios from 'axios';

// function HomeCard({ selectedDates }) {
//   const [averageTime, setAverageTime] = useState(null);
//   const [chartData, setChartData] = useState(null);
//   const [selectedSchema, setSelectedSchema] = useState('smrvid');
//   const [selectedAnatomy, setSelectedAnatomy] = useState('');
//   const [anatomyOptions, setAnatomyOptions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [dataFetched, setDataFetched] = useState(false);
//   const navigate = useNavigate();

//   const startDate = DateConverterSQL(selectedDates[0]);
//   const endDate = DateConverterSQL(selectedDates[1]);

//   const datesArrayPre = DateRange(startDate, endDate, 2);
//   const datesArray = [...new Set(datesArrayPre)];

//   useEffect(() => {
//     const fetchAnatomyOptions = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           navigate('/login');
//           return;
//         }

//         const response = await axios.get('http://localhost:3000/api/getAnatomyOptionsDate', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           params: {
//             selectedSchema,
//             startDate,
//             endDate,  
//           },
//         });

//         // const response = await axios.get('http://localhost:3000/api/getAnatomyOptions', {
//         //   headers: {
//         //     Authorization: `Bearer ${token}`,
//         //   },
//         // });


//         setAnatomyOptions(response.data);
//         if (response.data.length > 0) {
//           setSelectedAnatomy(response.data[0]); // Set the first anatomy option as default
//         }
//       } catch (error) {
//         console.error('Error fetching anatomy options:', error);
//         if (error.response && error.response.status === 401) {
//           navigate('/login');
//         }
//       }
//     };

//     fetchAnatomyOptions();
//   }, [navigate]);

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       if (!selectedSchema || !selectedAnatomy || !endDate) {
//         console.log('One or more required fields are missing.');
//         setAverageTime(null);
//         setChartData(null);
//         setIsLoading(false);
//         return;
//       }

//       const token = localStorage.getItem('token');
//       if (!token) {
//         navigate('/login');
//         return;
//       }

//       const decodedToken = JSON.parse(atob(token.split('.')[1]));
//       const currentTime = Date.now() / 1000;

//       if (decodedToken.exp < currentTime) {
//         navigate('/login');
//         return;
//       }

//       const results = [];
//       for (let i = 0; i < datesArray.length; i++) {
//         const queryDate = String(datesArray[i]);

//         const response = await axios.post(
//           'http://localhost:3000/api/getAnatomyData',
//           {
//             selectedSchema,
//             selectedAnatomy,
//             queryDate,
//             cacheBuster: new Date().getTime(),
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         const singleResult = response.data;
//         const averageTimeStr = singleResult.data.averageTime;
//         const averageTimeNum = parseFloat(averageTimeStr);
//         const averageTimeRounded = Math.round(averageTimeNum * 10) / 10;
//         results.push(averageTimeRounded);
//       }

//       const sum = results.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
//       const averagePre = sum / results.length;
//       const average = Math.round(averagePre * 10) / 10;

//       if (average && average !== 0) {
//         setAverageTime(average);
//         setChartData({
//           labels: datesArray,
//           datasets: [
//             {
//               label: 'Average Time',
//               data: results,
//               fill: true,
//               backgroundColor: `rgba(${hexToRGB(tailwindConfig().theme.colors.blue[500])}, 0.08)`,
//               borderColor: tailwindConfig().theme.colors.blue[500],
//               borderWidth: 2,
//               tension: 0.3,
//               pointRadius: 3,
//               pointHoverRadius: 5,
//               pointBackgroundColor: tailwindConfig().theme.colors.blue[500],
//               pointHoverBackgroundColor: tailwindConfig().theme.colors.blue[500],
//               pointBorderWidth: 2,
//               pointHoverBorderWidth: 3,
//             },
//           ],
//         });

//         setDataFetched(true);
//       } else {
//         setAverageTime(null);
//         setChartData(null);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       setError('No data for these parameters.');
//       setChartData(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedSchema, selectedAnatomy, endDate, navigate, datesArray]);

//   useEffect(() => {
//     const logoutUser = () => {
//       localStorage.removeItem('token');
//       localStorage.removeItem('loginTime');
//       navigate('/login');
//     };

//     const handleActivity = () => {
//       const currentTime = Date.now();
//       const loginTime = localStorage.getItem('loginTime');
//       if (currentTime - loginTime > 30 * 60 * 1000) {
//         logoutUser();
//       } else {
//         localStorage.setItem('loginTime', currentTime);
//       }
//     };

//     const resetTimer = () => {
//       clearTimeout(window.logoutTimer);
//       window.logoutTimer = setTimeout(logoutUser, 30 * 60 * 1000);
//     };

//     window.addEventListener('mousemove', handleActivity);
//     window.addEventListener('keydown', handleActivity);
//     resetTimer();

//     return () => {
//       window.removeEventListener('mousemove', handleActivity);
//       window.removeEventListener('keydown', handleActivity);
//       clearTimeout(window.logoutTimer);
//     };
//   }, [navigate]);

//   const handleTableChange = (e) => {
//     if (e.target.name === 'schema') {
//       setSelectedSchema(e.target.value);
//     } else if (e.target.name === 'anatomy') {
//       setSelectedAnatomy(e.target.value);
//     }
//   };

//   return (
//     <div className="flex flex-col col-span-full sm:col-span-6 xl:col-span-4 bg-white dark:bg-slate-800 shadow-lg rounded-sm border border-slate-200 dark:border-slate-700">
//       <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
//         <h2 className="font-semibold text-slate-800 dark:text-slate-100">Scan Length by Date and Anatomy</h2>
//         <select
//           name="schema"
//           value={selectedSchema}
//           onChange={handleTableChange}
//           className="mt-2 p-3 border rounded w-full"
//           style={{ width: '100%', marginBottom: '10px' }}
//         >
//           <option value="smrvid">SMRVID</option>
//           <option value="gmri3">GMRI3</option>
//           <option value="gmri4">GMRI4</option>
//           <option value="emri">EMRI</option>
//         </select>
//         <select
//           name="anatomy"
//           value={selectedAnatomy}
//           onChange={handleTableChange}
//           className="mt-2 p-3 border rounded w-full"
//           style={{ width: '100%', marginBottom: '10px' }}
//         >
//           {anatomyOptions.map((option, index) => (
//             <option key={index} value={option}>
//               {option}
//             </option>
//           ))}
//         </select>
//         <button
//           onClick={fetchData}
//           className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//         >
//           Fetch Data
//         </button>
//       </header>
//       <div className="p-3">
//         {isLoading ? (
//           <div>Loading...</div>
//         ) : error ? (
//           <div className="text-red-500">{error}</div>
//         ) : averageTime !== null ? (
//           <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
//             Average Time: {averageTime} minutes
//           </div>
//         ) : (
//           <div>No data available for the selected criteria.</div>
//         )}
//       </div>
//       {dataFetched && chartData && (
//         <div className="p-5">
//           <LineAnatomy data={chartData} width={389} height={256} />
//         </div>
//       )}
//     </div>
//   );
// }

// export default HomeCard;



