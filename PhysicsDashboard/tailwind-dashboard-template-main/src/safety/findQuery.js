const fs = require('fs');
const { flattenString } = require("./flattenString");

function findQuery(inputArray) {
    // Load keywords dictionary from 'keywords.json'
    const keyWordsfile = JSON.parse(fs.readFileSync('./Data/jsons/keywords.json', 'utf8'));
    const keyWords = keyWordsfile.keywords

    // Create an empty array to store the responses
    const resultArray = [];
    const matchedStrings = new Map(); // Temporary map to store matched strings and their corresponding number
    const unmatchedStrings = []; // Temporary array to store unmatched strings
    const uniqueChars = new Set(); // Set to store unique characters for assigning to unmatched strings
    const arraysWithSR = new Set(); // Set to store arrays for which 'sr' has been appended
    let counter = 1; // Counter for assigning new numbers

    // Function to assign a unique letter to unmatched strings
    function assignUniqueLetter() {
        let letter = 'A';
        while (uniqueChars.has(letter)) {
            letter = String.fromCharCode(letter.charCodeAt(0) + 1);
        }
        uniqueChars.add(letter);
        return letter;
    }

    // Iterate through each inner array
    inputArray.forEach(innerArray => {
        const responses = [];

        // Iterate through the elements of the inner array
        innerArray.forEach(email => {
            const itemPre = JSON.stringify(email);
            // Ensure item is a string before processing
            if (typeof itemPre !== 'string') {
                responses.push('invalid');
                return; // Skip further processing for this element
            }

            // Check if the item contains the specified substring
            const item = flattenString(itemPre);
            const match = /\bFrom:MRISafety\b/.test(item);
            if (match) {
                let number;
                // If the string is already in matchedStrings map, use the existing number
                if (matchedStrings.has(item)) {
                    number = matchedStrings.get(item);
                } else {
                    // If it's a new string, assign a new number
                    number = counter++;
                    matchedStrings.set(item, number);
                }
                responses.push(number); // Push the number to responses
            } else {
                let letter;
                // If the string is already in unmatchedStrings, use the assigned letter
                const index = unmatchedStrings.indexOf(item);
                if (index !== -1) {
                    letter = String.fromCharCode('A'.charCodeAt(0) + index);
                } else {
                    // If it's a new unmatched string, assign a unique letter
                    letter = assignUniqueLetter();
                    unmatchedStrings.push(item);
                }
                responses.push(letter); // Push the letter to responses
            }

            // Check if the item contains any keywords
            if (!arraysWithSR.has(innerArray) && keyWords.some(word => item.includes(word))) {
                responses.push('sr');
                arraysWithSR.add(innerArray);
            }
        });

        // Push the responses of the inner array to the resultArray
        resultArray.push(responses);
    });

    // Define a function to replace 'sr' with 'sr{suffix}'
    function replaceSrWithSuffix(item, suffix) {
        return item.replace(/sr/g, `sr${suffix}`);
    }

    resultArray.forEach((innerArray, index) => {
        innerArray.forEach((item, i) => {
            if (typeof item === 'string' && item.includes('sr')) {
                const suffix = index + 1;
                innerArray[i] = replaceSrWithSuffix(item, suffix);
            }
        });
    });


    // Return the resultArray
    return resultArray;
}

module.exports = { findQuery };
