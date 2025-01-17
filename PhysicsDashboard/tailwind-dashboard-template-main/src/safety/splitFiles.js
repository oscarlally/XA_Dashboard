const fs = require('fs').promises;

async function splitFiles(filePaths) {
    const keywords = ['FW', 'CC', 'From', 'To'];
    const filesections = [];

    for (const filePath of filePaths) {
        try {
            const data = await fs.readFile(filePath, 'utf8');

            const sections = data.split('\n').reduce((acc, line) => {
                if (line.includes(':') && keywords.some(keyword => line.includes(keyword + ':'))) {
                    acc.push([line]);
                } else {
                    acc[acc.length - 1].push(line);
                }
                return acc;
            }, [[]]).filter(section => section.length > 0);

            for (let i = 1; i < sections.length; i++) {
                const currentSection = sections[i];
                const previousSection = sections[i - 1];
                if (previousSection.length === 1 && previousSection[0].includes(':')) {
                    sections[i - 1] = [...previousSection, ...currentSection];
                    sections.splice(i, 1);
                    i--;
                }
            }

            filesections.push(sections);
        } catch (err) {
            console.error('Error reading file:', err);
        }
    }

    return filesections;
}

module.exports = { splitFiles };
