function AverageDataSafety(datasets) {
  // Check if datasets is not an array or empty
  if (!Array.isArray(datasets) || datasets.length === 0) {
    return [[], []]; // Return empty arrays if datasets is not valid
  }

  const divisor = datasets.length;

  // Initialize cumulative sum arrays
  const cumulativeSumRes = Array(datasets[0].responseRate.length).fill(0);

  // Calculate cumulative sums
  for (let i = 0; i < divisor; i++) {
    for (let j = 0; j < datasets[i].noRequests.length; j++) {
      cumulativeSumRes[j] += datasets[i].responseRate[j];
    }
  }

  // Calculate averages
  const averageRes = cumulativeSumRes.map(value => value / divisor);

  const averageResponse = [averageRes[0], 100-averageRes[0]]

  return averageResponse;
}

export default AverageDataSafety;
