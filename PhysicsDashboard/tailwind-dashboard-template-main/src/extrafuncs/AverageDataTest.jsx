function AverageDataTest(datasets) {
  if (!Array.isArray(datasets) || datasets.length === 0) {
    throw new Error("Invalid datasets. Expected an array with at least one element.");
  }

  const numDatasets = datasets.length;
  const adjustedDataArrays = [];
  const labelsArrays = [];
  const startTimes = [];
  const endTimes = [];

  for (let i = 0; i < numDatasets; i++) {
    const currentDataset = datasets[i];
    const labels = currentDataset[0].labels; // Assuming labels are same for all datasets
    const adjustedData = currentDataset[0].data;
    const start = currentDataset[0].start;
    const end = currentDataset[0].end;

    adjustedDataArrays.push(adjustedData);
    labelsArrays.push(labels);
    startTimes.push(decimalToTime(start));
    endTimes.push(decimalToTime(end));
  }

  return [adjustedDataArrays, labelsArrays, startTimes, endTimes];
}

function decimalToTime(decimal) {
  const hour = Math.floor(decimal);
  const minute = Math.round((decimal - hour) * 60);
  const timeString = hour + ":" + (minute < 10 ? "0" : "") + minute;
  return timeString;
}

export default AverageDataTest;
