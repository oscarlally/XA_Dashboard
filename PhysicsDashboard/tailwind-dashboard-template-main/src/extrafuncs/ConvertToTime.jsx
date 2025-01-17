
function ConvertToTime(num) {
  // Extract the integer part as hours
  const hours = Math.floor(num);
  
  // Convert the fractional part to minutes
  const minutes = Math.round((num - hours) * 60);
  
  // Format the time as "HH:MM"
  const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  
  return formattedTime;
}

export default ConvertToTime;
