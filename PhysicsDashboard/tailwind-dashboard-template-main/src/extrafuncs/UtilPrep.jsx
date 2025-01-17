function UtilPrep(list2D) {
   
   // Iterate over the 2D list
  for (let i = 0; i < list2D.length - 1; i++) {
    let currentList = list2D[i];
    let nextList = list2D[i + 1];
    // Check if the next list contains a 3
    if (nextList.includes(3)) {
      // Append the second element of the next list to the current list
      currentList.push(nextList[1]);
    }
  }

  // Return the modified list2D
  return list2D;
}

export default UtilPrep;