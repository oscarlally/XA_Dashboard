function TimeDifference(startTimes, endTimes) {
    if (startTimes.length !== endTimes.length) {
        throw new Error("Arrays must have the same length");
    }

    const timeDifferences = [];
    for (let i = 0; i < startTimes.length; i++) {
        const startTime = convertTimeToMinutes(startTimes[i]);
        const endTime = convertTimeToMinutes(endTimes[i]);
        timeDifferences.push(endTime - startTime);
    }
    return timeDifferences;
}

function convertTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

export default TimeDifference;
