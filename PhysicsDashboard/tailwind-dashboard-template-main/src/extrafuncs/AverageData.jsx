function AverageData(datasets) {
  
  let labels = undefined;
  const cumLength = datasets[0].data.length;
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

  const adjustedData = cumulativeSum.map(value => Math.round(value / divisor));
  const sum = adjustedData.reduce((acc, currentValue) => acc + currentValue, 0);

  if (sum !== 100) {
    const difference = 100 - sum;

    // Find the index of the maximum value and decrement it by the difference
    const maxIndex = adjustedData.indexOf(Math.max(...adjustedData));
    adjustedData[maxIndex] += difference;
  }

  return [adjustedData, labels];
}

export default AverageData;

