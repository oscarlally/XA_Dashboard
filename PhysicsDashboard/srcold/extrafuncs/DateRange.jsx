import moment from 'moment';

function DateRange(startDate, endDate, underscored) {
  const datesInRange = [];
  let dateFormat = underscored ? 'MM-DD-YYYY' : 'DD_MM_YYYY';
  let currentDate = moment(startDate, 'DD_MM_YYYY');
  const lastDate = moment(endDate, 'DD_MM_YYYY');

  while (currentDate <= lastDate) {
    datesInRange.push(currentDate.format(dateFormat));
    currentDate.add(1, 'days');
  }

  // If startDate and endDate are the same, include that date
  if (datesInRange.length === 0 && currentDate.isSame(lastDate, 'day')) {
    datesInRange.push(currentDate.format(dateFormat));
  }

  return datesInRange;
}

export default DateRange;
