function AverageLengths(datasets) {
  if (!Array.isArray(datasets) || datasets.length === 0) {
    throw new Error("Invalid datasets. Expected an array with at least one element.");
  }

  const numDatasets = datasets.length;
  const labelsArrays = [];
  const averageDataArrays = [];

  for (let i = 0; i < numDatasets; i++) {
    const data = datasets[i];
    const keys = Object.keys(data);
    const labels = [];
    const averageData = [];

    keys.forEach(key => {
      labels.push(key);
      const values = data[key];
      const sum = values.reduce((acc, curr) => acc + curr, 0);
      const avg = sum / values.length;
      averageData.push(avg.toFixed(2));
    });

    labelsArrays.push(labels);
    averageDataArrays.push(averageData);
  }

  return [labelsArrays, averageDataArrays];
}

export default AverageLengths;
