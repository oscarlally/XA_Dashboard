
function replaceString(arr, oldString, newString) {
  return arr.map(item => item.replace(oldString, newString));
}

export default replaceString