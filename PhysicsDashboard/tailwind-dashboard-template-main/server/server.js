const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

const app = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'oscarrules';

// Middleware setup
const corsOptions = {
  // origin: 'http://10.189.108.198:5173', // Your React app's URL
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Serve static files from the React app build directory
app.use(express.static('dist')); // Point to the correct build directory

// PostgreSQL client setup
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.username = decoded.username;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Check if the credentials match the ones in config.env
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
  }

  // If credentials don't match, return invalid credentials
  res.status(400).json({ error: 'Invalid credentials' });
});



// Anatomy options endpoint
app.get('/api/getAnatomyOptions', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT protocol AS anatomy
      FROM ${selectedSchema}.scans s
    `);

    // Map the rows and filter to keep only non-numerical strings
    const anatomyOptions = rows
      .map(row => row.anatomy)
      .filter(anatomy => isNaN(anatomy));

    res.json(anatomyOptions);
  } catch (error) {
    console.error('Error fetching anatomy options', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//NEW STUFF

// Date queried Anatomy options endpoint
app.get('/api/getAnatomyOptionsDateDistinct', authenticate, async (req, res) => {
  try {
    const { selectedSchema, startDate, endDate } = req.query; // Get the start and end dates from query parameters

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required' });
    }

    const { rows } = await pool.query(`
      SELECT DISTINCT protocol AS anatomy
      FROM ${selectedSchema}.scans s
      JOIN ${selectedSchema}.dates d ON s.date_id = d.id
      WHERE d.date BETWEEN $1 AND $2
    `, [startDate, endDate]);

    // Map the rows and filter to keep only non-numerical strings
    const anatomyOptions = rows
      .map(row => row.anatomy)
      .filter(anatomy => isNaN(anatomy));

    res.json(anatomyOptions);
  } catch (error) {
    console.error('Error fetching anatomy options', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Date queried Anatomy options endpoint
app.get('/api/getAnatomyOptionsDate', authenticate, async (req, res) => {
  try {
    const { selectedSchema, startDate, endDate } = req.query; // Get the start and end dates from query parameters

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required' });
    }

    const { rows } = await pool.query(`
      SELECT protocol AS anatomy
      FROM ${selectedSchema}.scans s
      JOIN ${selectedSchema}.dates d ON s.date_id = d.id
      WHERE d.date BETWEEN $1 AND $2
      ORDER BY s.id
    `, [startDate, endDate]);

    // Map the rows and filter to keep only non-numerical strings
    const anatomyOptions = rows
      .map(row => row.anatomy)
      .filter(anatomy => isNaN(anatomy));

    res.json(anatomyOptions);
  } catch (error) {
    console.error('Error fetching anatomy options', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// Data fetching endpoint
app.post('/api/getAnatomyDataAverage', authenticate, async (req, res) => {
  const { selectedSchema, selectedAnatomy, queryDate } = req.body;

  if (!selectedSchema || !selectedAnatomy || !queryDate) {
    return res.status(400).json({ error: 'Schema, anatomy, and date are required' });
  }

  try {
    console.log(`Received Query Date: ${queryDate}`);

    const query = `
      SELECT AVG(CAST(s.scan_length AS NUMERIC)) AS average_time
      FROM ${selectedSchema}.scans s
      JOIN ${selectedSchema}.dates d ON s.date_id = d.id
      WHERE s.protocol = $1 
      AND d.date = $2
    `;

    const result = await pool.query(query, [selectedAnatomy, queryDate]);

    const averageTime = result.rows[0].average_time || 0;
    res.json({ success: true, data: { averageTime } });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Data fetching endpoint
app.post('/api/getAnatomyData', authenticate, async (req, res) => {
  const { selectedSchema, selectedAnatomy, queryDate } = req.body;

  if (!selectedSchema || !selectedAnatomy || !queryDate) {
    return res.status(400).json({ error: 'Schema, anatomy, and date are required' });
  }

  try {
    console.log(`Received Query Date: ${queryDate}`);

    const query = `
      SELECT s.scan_length
      FROM ${selectedSchema}.scans s
      JOIN ${selectedSchema}.dates d ON s.date_id = d.id
      WHERE s.protocol = $1 
      AND d.date = $2
    `;

    const result = await pool.query(query, [selectedAnatomy, queryDate]);

    // Map through the rows to get an array of scan_length values
    const scanLengths = result.rows.map(row => row.scan_length);

    res.json({ success: true, data: { scanLengths } });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Data fetching endpoint
app.post('/api/getChangeData', authenticate, async (req, res) => {
  const { selectedSchema, selectedAnatomy, queryDate } = req.body;

  if (!selectedSchema || !selectedAnatomy || !queryDate) {
    return res.status(400).json({ error: 'Schema, anatomy, and date are required' });
  }

  try {
    console.log(`Received Query Date: ${queryDate}`);

    const query = `
      SELECT s.other_info
      FROM ${selectedSchema}.scans s
      JOIN ${selectedSchema}.dates d ON s.date_id = d.id
      WHERE s.protocol = $1 
      AND d.date = $2
    `;

    const result = await pool.query(query, [selectedAnatomy, queryDate]);

    // Map through the rows to get an array of scan_length values
    const otherInformation = result.rows.map(row => row.other_info);

    res.json({ success: true, data: { otherInformation } });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Data fetching endpoint
app.post('/api/getCustomQuery', authenticate, async (req, res) => {
  const { selectedSchema, queryDate, columnName, tableName } = req.body;

  if (!selectedSchema || !queryDate || !columnName || !tableName) {
    return res.status(400).json({ error: 'Schema, date, column name, and table name are required' });
  }

  try {
    console.log(`Received Query Date: ${queryDate}`);

    // Query to fetch the average from the specified column using the date linked by the id
    const query = `
      SELECT AVG(CAST(${tableName}.${columnName} AS NUMERIC)) AS output_param
      FROM ${selectedSchema}.${tableName} ${tableName}
      JOIN ${selectedSchema}.dates d ON ${tableName}.date_id = d.id
      WHERE d.date = $1 
    `;

    const result = await pool.query(query, [queryDate]);

    // Handle the case where no rows are returned
    const outputParam = result.rows[0]?.output_param || 0;
    res.json({ success: true, data: { outputParam } });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Data fetching endpoint
app.post('/api/getAnatomyTimes', authenticate, async (req, res) => {
  const { selectedSchema, startDate, endDate } = req.body;

  if (!selectedSchema || !startDate || !endDate) {
    return res.status(400).json({ error: 'Schema, start date, and end date are required' });
  }

  try {
    const query = `
      SELECT s.protocol, AVG(CAST(s.scan_length AS NUMERIC)) AS average_time
      FROM ${selectedSchema}.scans s
      JOIN ${selectedSchema}.dates d ON s.date_id = d.id
      WHERE d.date BETWEEN $1 AND $2
      GROUP BY s.protocol
    `;

    const result = await pool.query(query, [startDate, endDate]);

    const protocolsData = result.rows.map(row => ({
      protocol: row.protocol,
      averageTime: parseFloat(row.average_time),
    }));

    res.json({ success: true, data: protocolsData });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Data fetching endpoint
app.post('/api/getAnatomyTimesWithNos', authenticate, async (req, res) => {
  const { selectedSchema, startDate, endDate } = req.body;

  if (!selectedSchema || !startDate || !endDate) {
    return res.status(400).json({ error: 'Schema, start date, and end date are required' });
  }

  try {
    const query = `
      SELECT s.protocol, 
             AVG(CAST(s.scan_length AS NUMERIC)) AS average_time, 
             COUNT(s.scan_length) AS data_points
      FROM ${selectedSchema}.scans s
      JOIN ${selectedSchema}.dates d ON s.date_id = d.id
      WHERE d.date BETWEEN $1 AND $2
      GROUP BY s.protocol
    `;

    const result = await pool.query(query, [startDate, endDate]);

    const protocolsData = result.rows.map(row => ({
      protocol: row.protocol,
      averageTime: parseFloat(row.average_time),
      dataPoints: parseInt(row.data_points)  // Add dataPoints to the response
    }));

    res.json({ success: true, data: protocolsData });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Data fetching endpoint
app.post('/api/getAnatomyComparisonTimesWithNos', authenticate, async (req, res) => {
  const { selectedSchema, selectedSchema2, startDate, endDate } = req.body;

  if (!selectedSchema || !selectedSchema2 || !startDate || !endDate) {
    return res.status(400).json({ error: 'Schemas, start date, and end date are required' });
  }

  try {
    const query = `
      SELECT s1.protocol,
             AVG(CAST(s1.scan_length AS NUMERIC)) AS average_time_schema1, 
             (SELECT COUNT(DISTINCT s1_inner.id)
              FROM ${selectedSchema}.scans s1_inner
              JOIN ${selectedSchema}.dates d1_inner ON s1_inner.date_id = d1_inner.id
              WHERE s1_inner.protocol = s1.protocol AND d1_inner.date BETWEEN $1 AND $2
             ) AS data_points_schema1,
             AVG(CAST(s2.scan_length AS NUMERIC)) AS average_time_schema2, 
             (SELECT COUNT(DISTINCT s2_inner.id)
              FROM ${selectedSchema2}.scans s2_inner
              JOIN ${selectedSchema2}.dates d2_inner ON s2_inner.date_id = d2_inner.id
              WHERE s2_inner.protocol = s1.protocol AND d2_inner.date BETWEEN $1 AND $2
             ) AS data_points_schema2
      FROM ${selectedSchema}.scans s1
      JOIN ${selectedSchema}.dates d1 ON s1.date_id = d1.id
      JOIN ${selectedSchema2}.scans s2 ON s1.protocol = s2.protocol
      JOIN ${selectedSchema2}.dates d2 ON s2.date_id = d2.id
      WHERE d1.date BETWEEN $1 AND $2
        AND d2.date BETWEEN $1 AND $2
      GROUP BY s1.protocol
      HAVING COUNT(DISTINCT s2.protocol) > 0
    `;

    const result = await pool.query(query, [startDate, endDate]);

    const protocolsData = result.rows.map(row => ({
      protocol: row.protocol,
      averageTime1: parseFloat(row.average_time_schema1),
      dataPoints1: parseInt(row.data_points_schema1),
      averageTime2: parseFloat(row.average_time_schema2),
      dataPoints2: parseInt(row.data_points_schema2)
    }));

    res.json({ success: true, data: protocolsData });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Data fetching endpoint
app.post('/api/getCustomQuerySingle', authenticate, async (req, res) => {
  const { selectedSchema, queryDate, columnName, tableName } = req.body;

  if (!selectedSchema || !queryDate || !columnName || !tableName) {
    return res.status(400).json({ error: 'Schema, date, column name, and table name are required' });
  }

  try {
    console.log(`Received Query Date: ${queryDate}`);

    // Query to fetch all values from the specified column using the date linked by the id
    const query = `
      SELECT ${tableName}.${columnName} AS output_param
      FROM ${selectedSchema}.${tableName} ${tableName}
      JOIN ${selectedSchema}.dates d ON ${tableName}.date_id = d.id
      WHERE d.date = $1 
    `;

    const result = await pool.query(query, [queryDate]);

    // Extract all values from the query result
    const outputParams = result.rows.map(row => row.output_param);
    res.json({ success: true, data: { outputParams } });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Dashboard route
app.get('/dashboard', authenticate, (req, res) => {
  res.send('Welcome to the Dashboard');
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

