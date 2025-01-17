function DateConverterSQL(dateStringPre) {
  const dateString = String(dateStringPre);
  const [day, month, year] = dateString.split('_').map(Number);

  // Create a date and set the time to noon
  const date = new Date(year, month - 1, day);
  date.setHours(12, 0, 0, 0); // Set time to 12:00:00.000

  return date;
}

function formatDate(dateInput) {
  const date = parseDateString(dateInput);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


export default DateConverterSQL;
