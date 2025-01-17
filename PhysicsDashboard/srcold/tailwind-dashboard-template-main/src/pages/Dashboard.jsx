// Dashboard.jsx

import React, { useState } from 'react';
import Sidebar from '../partials/Sidebar';
import Header from '../partials/Header';
import Datepicker from '../components/Datepicker';
import DashboardCardEfficiency from '../partials/dashboard/DashboardCardEfficiency';
import DashboardCardDayInfo from '../partials/dashboard/DashboardCardDayInfo';
import DashboardCardTemp1 from '../partials/dashboard/DashboardCardTemp1';
import moment from 'moment';


function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initialStartDate = moment().subtract(1, 'day').format('DD_MM_YYYY');
  const initialEndDate = moment().subtract(1, 'day').format('DD_MM_YYYY');
  const [selectedDates, setSelectedDates] = useState([initialStartDate, initialEndDate]);


  const handleDateChange = (dates) => {
    setSelectedDates(dates);
    console.log('Selected Dates:', dates);
  };

  const scannerName = 'SMRVID';

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
            <div className="grid grid-cols-12 gap-6">
              {/* Doughnut chart (Efficiency) */}
              <DashboardCardEfficiency selectedDates={selectedDates} scannerName = {scannerName} />
              {/* Doughnut chart (Temperature) */}
              <DashboardCardTemp1 selectedDates={selectedDates} scannerName = {scannerName} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;

