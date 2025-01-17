// Utilisation.jsx

import React, { useState } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import Datepicker from '../components/Datepicker';
import UtilCard from '../partials/cards/UtilCard';
import moment from 'moment';


function Utilisation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initialStartDate = moment().format('DD_MM_YYYY');
  const initialEndDate = moment().format('DD_MM_YYYY');
  const [selectedDates, setSelectedDates] = useState([initialStartDate, initialEndDate]);

  const handleDateChange = (dates) => {
    setSelectedDates(dates);
    console.log('Selected Dates:', dates);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main>
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Datepicker built with flatpickr */}
                <Datepicker align="left" onDateChange={handleDateChange} />
              </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-15 gap-6">
              {/* Horizontal bar chart averge times */}
              <UtilCard selectedDates={selectedDates}/>
            </div>       
          </div>
        </main>
      </div>
    </div>
  );
}

export default Utilisation;

