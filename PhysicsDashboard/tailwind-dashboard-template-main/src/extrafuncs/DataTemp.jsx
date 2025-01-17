// DataTemp.js

function DataTemp(datasets) {
  
  const tempArray = []
  const divisor = datasets.length;


  for (let i = 0; i < divisor; i++) {
    const a = datasets[i].data
    tempArray.push(a[0]);
    }

  return tempArray;
}

export default DataTemp;

