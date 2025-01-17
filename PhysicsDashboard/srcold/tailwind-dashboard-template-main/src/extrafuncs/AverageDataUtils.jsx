function AverageDataUtils(datasets) {
  if (!Array.isArray(datasets) || datasets.length === 0) {
    throw new Error("Invalid datasets. Expected an array with at least one element.");
  }

  let labels = undefined;
  const cumLength = datasets[0].data.length;
  const start = datasets[0].start
  const end = datasets[0].end
  const divisor = datasets.length;
  const cumulativeSum = Array.from({ length: cumLength }, () => 0);

  for (let i = 0; i < divisor; i++) {
    if (i === 0) {
      labels = datasets[i].labels;
    }

    for (let j = 0; j < cumulativeSum.length; j++) {
      cumulativeSum[j] += datasets[i].data[j];
    }
  }

  // Calculate the total sum of data points
  const totalSum = cumulativeSum.reduce((acc, value) => acc + value, 0);

  // Calculate the average value to be assigned to each data point
  const averageValue = totalSum / 100;

  // Distribute the average value equally to each data point
  const adjustedData = cumulativeSum.map(value => (value / totalSum) * 100);

  function decimalToTime(decimal) {
    // Separate the integer and fractional parts
    var hour = Math.floor(decimal);
    var minute = Math.round((decimal - hour) * 60); // Convert fractional part to minutes

    // Format the time
    var timeString = hour + ":" + (minute < 10 ? "0" : "") + minute;

    return timeString;
}

  return [adjustedData, labels, decimalToTime(start), decimalToTime(end)];
}

export default AverageDataUtils;
