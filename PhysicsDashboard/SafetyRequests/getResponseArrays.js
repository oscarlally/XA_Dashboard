function getResponseArrays(arrays) {
    const parent = {};
    const arraysContainingSR = new Set(); // Set to store arrays containing 'sr'

    // Find function with path compression
    function find(x) {
        if (parent[x] === undefined) {
            return x;
        }
        parent[x] = find(parent[x]);
        return parent[x];
    }

    // Union function
    function union(x, y) {
        const rootX = find(x);
        const rootY = find(y);
        if (rootX !== rootY) {
            parent[rootY] = rootX;
        }
    }

    // Union-find on each pair of arrays
    arrays.forEach((arr, index) => {
        if (!arr.includes('sr') && arr.length > 1) {
            const firstElem = arr[0];
            for (let i = 1; i < arr.length; i++) {
                union(firstElem, arr[i]);
            }
        }
        if (arr.includes('sr')) {
            arraysContainingSR.add(index); // Mark arrays containing 'sr'
        }
    });

    // Group arrays by connected components
    const groups = {};
    arrays.forEach((arr, index) => {
        if (!arraysContainingSR.has(index)) {
            const root = find(arr[0]);
            if (!groups[root]) {
                groups[root] = new Set();
            }
            arr.forEach(element => groups[root].add(element));
        }
    });

    return Object.values(groups).map(group => Array.from(group));
}

module.exports = { getResponseArrays };
