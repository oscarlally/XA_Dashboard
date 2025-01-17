// DataTemp.js

function DataTemp(datasets) {
  
  const humArray = []
  const tempArray = []
  const divisor = datasets.length;


  for (let i = 0; i < divisor; i++) {
    const a = datasets[i].humid
    const b = datasets[i].temp
    humArray.push(a[0])
    tempArray.push(b[0]);
    }

  return [tempArray, humArray];
}

export default DataTemp;

