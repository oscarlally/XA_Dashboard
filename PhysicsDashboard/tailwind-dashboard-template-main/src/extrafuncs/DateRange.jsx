
import moment from 'moment';

function DateRange(startDate, endDate, formatOption) {
  const datesInRange = [];

  // Determine date format based on formatOption
  let dateFormat;
  switch (formatOption) {
    case 0:
      dateFormat = 'MM-DD-YYYY';
      break;
    case 1:
      dateFormat = 'DD_MM_YYYY';
      break;
    case 2:
      dateFormat = 'YYYY-MM-DD';
      break;
    default:
      throw new Error('Invalid formatOption');
  }

  // Initialize start and end dates using the selected format
  let currentDate = moment(startDate, dateFormat);
  const lastDate = moment(endDate, dateFormat);

  // Generate dates between startDate and endDate
  while (currentDate <= lastDate) {
    datesInRange.push(currentDate.format(dateFormat));
    currentDate.add(1, 'days');
  }

  return datesInRange;
}

export default DateRange;

