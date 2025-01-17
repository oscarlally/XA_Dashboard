function flattenString(inputString) {
    // Remove all spaces and quotes from the input string
    const flattenedString = inputString.replace(/[\s"']/g, '');
    return flattenedString;
}

module.exports = { flattenString };
