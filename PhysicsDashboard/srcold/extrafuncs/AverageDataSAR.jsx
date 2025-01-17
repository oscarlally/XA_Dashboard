function AverageDataSAR(datasets) {
  
  let labels = undefined;
  const divisor = datasets.length;
  // Length of the x axis
  const cumulativeSumPred = Array.from({ length: 6 }, () => 0);
  const cumulativeSumAcc = Array.from({ length: 6 }, () => 0);

  for (let i = 0; i < divisor; i++) {
    if (i === 0) {
      labels = datasets[i].labels;
    }

    for (let j = 0; j < cumulativeSumPred.length; j++) {
      cumulativeSumPred[j] += datasets[i].pred_dataset[j];
      cumulativeSumAcc[j] += datasets[i].actual_dataset[j];
    }
  }

  const adjustedDataPred = cumulativeSumPred.map(value => Math.round(value / divisor));

  const adjustedDataAcc = cumulativeSumAcc.map(value => Math.round(value / divisor));


  return [adjustedDataPred, adjustedDataAcc, labels];
}

export default AverageDataSAR;

