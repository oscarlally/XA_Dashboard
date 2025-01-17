import { getFiles } from './getFiles';
import { splitFiles } from './splitFiles';
import { findQuery } from './findQuery';
import { getResponseArrays } from './getResponseArrays';
import {flattenString } from './flattenString';


function getColumnLengths(array) {
    const columnLengths = array.map((row, index) => ({ column: index + 1, length: row.length }));
    return columnLengths;
}

function containsSrWithNumber(array) {
    let hasSr = false;
    let hasNumber = false;

    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] === 'string') {
            if (/sr\d+/.test(array[i])) {
                hasSr = true;
                if (/\d+/.test(array[i])) {
                    hasNumber = true;
                }
            }
        }
    }

    if (hasSr && hasNumber) {
        return 2; // Return 2 if 'sr' followed by a number is found
    } else if (hasSr) {
        return 1; // Return 1 if 'sr' without a number is found
    } else {
        return 0; // Return 0 if neither 'sr' nor a number is found
    }
}

function countOccurrences(array) {
    let count0 = 0;
    let count1 = 0;
    let count2 = 0;

    array.forEach(value => {
        if (value === 0) {
            count0++;
        } else if (value === 1) {
            count1++;
        } else if (value === 2) {
            count2++;
        }
    });

    const percentage = 100* count2/(count1 + count2)
    return percentage
    // return { percentage };
}


function safetyRequest({ date1 date2 }) {

    const fs = require('fs').promises;

    const directoryPath = './Data/SafetyRequests/Data/';
    const fullpath = directoryPath + date;

    const sameEvents = [];
    function countUniqueElements(arr) {
        const uniqueSet = new Set(arr); // Create a Set to store unique elements
        return uniqueSet.size; // Return the size of the Set, which represents the number of unique elements
    }

    getFiles(fullpath)
        .then(filenames => {
            const filesArray = filenames;
            console.log(filenames)
            splitFiles(filesArray)
                .then(resultArrays => {
                    const sectionArrays = resultArrays;

                    const columnLengths = getColumnLengths(resultArrays);
                    columnLengths.forEach(column => {
                        console.log(`Email ${column.column}, length: ${column.length}`);
                    });

                    const queryResult = findQuery(sectionArrays);
                    const responseResult = getResponseArrays(queryResult)

                    const result = responseResult.map(innerArray => containsSrWithNumber(innerArray));
                    const sucessRate = countOccurrences(result);
                    console.log('Reponse Rate is:', sucessRate);



                })
                .catch(error => {
                    console.error('Error:', error);
                });
        })
        .catch(error => {
            console.error('Error:', error);
        });

}



export default safetyRequest;