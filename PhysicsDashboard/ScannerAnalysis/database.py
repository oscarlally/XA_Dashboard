import sqlite3

# Connect to a local SQLite database (it will be created if it doesn't exist)
conn = sqlite3.connect('/Users/oscarlally/Downloads/local_database.db')
cursor = conn.cursor()

# Create table 'daily_data'
cursor.execute('''
    CREATE TABLE IF NOT EXISTS daily_data (
        body_part TEXT,
        time INTEGER
    )
''')

# Insert 10 instances into 'daily_data'
data = [
    ('knee', 10),
    ('knee', 20),
    ('knee', 30),
    ('knee', 40),
    ('knee', 50),
    ('hips', 10),
    ('hips', 20),
    ('hips', 30),
    ('hips', 40),
    ('hips', 50)
]

cursor.executemany('INSERT INTO daily_data (body_part, time) VALUES (?, ?)', data)

# Commit changes and close the connection
conn.commit()
conn.close()





# import sqlite3
# import os
#
# from psycopg2 import sql
# import psycopg2
#
# def create_postgres_db(data):
#     # PostgreSQL connection parameters
#     dbname = 'mriutilisation'
#     user = 'mridevs'
#     password = 'qwer1234'
#     host = 'localhost'  # or your PostgreSQL server IP address
#     port = '5432'  # default PostgreSQL port
#
#     # Connect to the PostgreSQL database
#     conn = psycopg2.connect(
#         dbname=dbname,
#         user=user,
#         password=password,
#         host=host,
#         port=port
#     )
#     cursor = conn.cursor()
#
#     # Function to create a schema
#     def create_schema(schema_name):
#         print(f'Creating schema {schema_name}...')
#         cursor.execute(f'CREATE SCHEMA IF NOT EXISTS {schema_name}')
#         conn.commit()
#
#     # Function to create tables within a schema
#     def create_tables(schema_name):
#         print(f'Creating tables in schema {schema_name}...')
#         cursor.execute(f'''
#         CREATE TABLE IF NOT EXISTS {schema_name}.Dates (
#             id SERIAL PRIMARY KEY,
#             date TEXT NOT NULL UNIQUE
#         )
#         ''')
#         cursor.execute(f'''
#         CREATE TABLE IF NOT EXISTS {schema_name}.Scans (
#             id SERIAL PRIMARY KEY,
#             date_id INTEGER NOT NULL,
#             patient_id TEXT NOT NULL,
#             patient_name TEXT NOT NULL,
#             start_time TEXT NOT NULL,
#             scan_length REAL NOT NULL,
#             protocol TEXT NOT NULL,
#             scan_type TEXT NOT NULL,
#             other_info TEXT,
#             FOREIGN KEY (date_id) REFERENCES {schema_name}.Dates(id)
#         )
#         ''')
#         cursor.execute(f'''
#         CREATE TABLE IF NOT EXISTS {schema_name}.timings_simple (
#             id SERIAL PRIMARY KEY,
#             scan_id INTEGER NOT NULL,
#             date_id INTEGER NOT NULL,
#             timings REAL[],
#             FOREIGN KEY (scan_id) REFERENCES {schema_name}.Scans(id),
#             FOREIGN KEY (date_id) REFERENCES {schema_name}.Dates(id)
#         )
#         ''')
#         conn.commit()
#
#     # Function to insert a date and get its id within a schema
#     def get_or_create_date(schema_name, date):
#         print(f'Getting or creating date {date} in schema {schema_name}...')
#         cursor.execute(f'SELECT id FROM {schema_name}.Dates WHERE date = %s', (date,))
#         date_id = cursor.fetchone()
#         if date_id:
#             return date_id[0]
#         cursor.execute(f'INSERT INTO {schema_name}.Dates (date) VALUES (%s) RETURNING id', (date,))
#         conn.commit()
#         return cursor.fetchone()[0]
#
#     # Function to insert scan data within a schema
#     def insert_scan(schema_name, date, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info=None):
#         date_id = get_or_create_date(schema_name, date)
#         cursor.execute(f'''
#         INSERT INTO {schema_name}.Scans (date_id, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info)
#         VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
#         ''', (date_id, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info))
#         conn.commit()
#         scan_id = cursor.fetchone()[0]  # Ensure scan_id is retrieved as an integer
#         print(f'Inserted scan with scan_id={scan_id}')  # Debug print
#         return scan_id
#
#     # Process the data and insert scans
#     for record in data:
#         schema_name, date, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info = record
#         create_schema(schema_name)
#         create_tables(schema_name)
#         scan_id = insert_scan(schema_name, date, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info)
#         # Store timings list can be called here if you have the numbers
#         # For example:
#         timings = [10.5, 20.0, 30.25]  # Replace with actual timings data
#         store_timings_list(timings, schema_name, scan_id, date)
#
#     # Query data to check insertion (example for one schema)
#     schema_name = data[0][0]
#     print(f'Querying data from schema {schema_name}...')
#     cursor.execute(f'''
#     SELECT Dates.date, Scans.patient_id, Scans.patient_name, Scans.start_time, Scans.scan_length, Scans.protocol, Scans.scan_type, Scans.other_info
#     FROM {schema_name}.Scans
#     JOIN {schema_name}.Dates ON Scans.date_id = Dates.id
#     ''')
#     rows = cursor.fetchall()
#     for row in rows:
#         print(row)
#
#     # Close the connection
#     cursor.close()
#     conn.close()
#
#
# def store_timings_list(numbers, schema, scan_id, date):
#     # PostgreSQL connection parameters
#     dbname = 'mriutilisation'
#     user = 'mridevs'
#     password = 'qwer1234'
#     host = 'localhost'
#     port = '5432'
#
#     try:
#         conn = psycopg2.connect(
#             dbname=dbname,
#             user=user,
#             password=password,
#             host=host,
#             port=port
#         )
#         cursor = conn.cursor()
#
#         # Get or create date_id for the provided date
#         cursor.execute(f'SELECT id FROM {schema}.Dates WHERE date = %s', (date,))
#         date_id = cursor.fetchone()
#         if not date_id:
#             cursor.execute(f'INSERT INTO {schema}.Dates (date) VALUES (%s) RETURNING id', (date,))
#             conn.commit()
#             date_id = cursor.fetchone()[0]
#         else:
#             date_id = date_id[0]
#
#         # Debug prints
#         print(f'Inserting into {schema}.timings_simple with scan_id={scan_id}, date_id={date_id}, and timings={numbers}')
#         print(f'Types: scan_id={type(scan_id)}, date_id={type(date_id)}, timings={type(numbers)}')
#
#         # Insert the list of numbers into the table
#         insert_query = sql.SQL("""
#             INSERT INTO {schema}.timings_simple (scan_id, date_id, timings) VALUES (%s, %s, %s);
#         """).format(
#             schema=sql.Identifier(schema)
#         )
#         cursor.execute(insert_query, (scan_id, date_id, numbers))
#
#         conn.commit()
#         print("Data inserted successfully into timings column")
#
#     except psycopg2.Error as e:
#         print(f"An error occurred: {e.pgcode} - {e.pgerror}")
#     except Exception as e:
#         print(f"An unexpected error occurred: {e}")
#     finally:
#         if cursor:
#             cursor.close()
#         if conn:
#             conn.close()
#
#
#
#
#
# def create_db(file_path, data):
#
#     # Define the path where the SQLite database will be saved
#     database_path = f'{file_path}/scanning_data.db'
#
#     # Ensure the directory exists
#     os.makedirs(os.path.dirname(database_path), exist_ok=True)
#
#     # Connect to the SQLite database (or create it if it doesn't exist)
#     conn = sqlite3.connect(database_path)
#     cursor = conn.cursor()
#
#     # Create the Dates table (if it doesn't exist)
#     cursor.execute('''
#     CREATE TABLE IF NOT EXISTS Dates (
#         id INTEGER PRIMARY KEY,
#         date TEXT NOT NULL UNIQUE
#     )
#     ''')
#
#     # Create the Scans table (if it doesn't exist)
#     cursor.execute('''
#     CREATE TABLE IF NOT EXISTS Scans (
#         id INTEGER PRIMARY KEY,
#         date_id INTEGER NOT NULL,
#         patient_id TEXT NOT NULL,
#         patient_name TEXT NOT NULL,
#         start_time TEXT NOT NULL,
#         scan_length REAL NOT NULL,
#         protocol TEXT NOT NULL,
#         scan_type TEXT NOT NULL,
#         other_info TEXT,
#         FOREIGN KEY (date_id) REFERENCES Dates(id)
#     )
#     ''')
#
#     # Function to insert a date and get its id
#     def get_or_create_date(date):
#         cursor.execute('SELECT id FROM Dates WHERE date = ?', (date,))
#         date_id = cursor.fetchone()
#         if date_id:
#             return date_id[0]
#         cursor.execute('INSERT INTO Dates (date) VALUES (?)', (date,))
#         conn.commit()
#         return cursor.lastrowid
#
#     # Function to insert scan data
#     def insert_scan(date, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info=None):
#         date_id = get_or_create_date(date)
#         cursor.execute('''
#         INSERT INTO Scans (date_id, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info)
#         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
#         ''', (date_id, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info))
#         conn.commit()
#
#     # Insert the example data
#     for record in data:
#         insert_scan(*record)
#
#     # Query data to check insertion
#     cursor.execute('''
#     SELECT Dates.date, Scans.patient_id, Scans.patient_name, Scans.start_time, Scans.scan_length, Scans.protocol, Scans.scan_type, Scans.other_info
#     FROM Scans
#     JOIN Dates ON Scans.date_id = Dates.id
#     ''')
#     rows = cursor.fetchall()
#     # for row in rows:
#     #     print(row)
#
#     # Close the connection
#     conn.close()
