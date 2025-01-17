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

  const adjustedData = cumulativeSum.map(value => Math.round((value / divisor) / (cumulativeSum.reduce((a, b) => a + b, 0) / 100)));
  const sum = adjustedData.reduce((acc, currentValue) => acc + currentValue, 0);
  const difference = 100 - sum;

  // Distribute the adjustment proportionally to the original values
  for (let i = 0; i < adjustedData.length; i++) {
    adjustedData[i] += Math.floor((difference * adjustedData[i]) / sum);
  }

  // Adjust the remaining difference, if any
  let remainingDifference = difference % adjustedData.length;
  for (let i = 0; i < remainingDifference; i++) {
    adjustedData[i]++;
  }

  return [adjustedData, labels];
}

export default AverageData;