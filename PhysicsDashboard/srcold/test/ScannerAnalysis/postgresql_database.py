from psycopg2 import sql
import psycopg2


def initialise_db(schema_name):

    # PostgreSQL connection parameters
    dbname = 'mriutilisation'
    user = 'mridevs'
    password = 'qwer1234'
    host = 'localhost'  # or your PostgreSQL server IP address
    port = '5432'  # default PostgreSQL port

    # Connect to the PostgreSQL database
    conn = psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
    )
    cursor = conn.cursor()

    # Function to create a schema
    def create_schema(schema_name):
        # print(f'Creating schema {schema_name}...')
        cursor.execute(f'CREATE SCHEMA IF NOT EXISTS {schema_name}')
        conn.commit()

    # Function to create tables within a schema
    def create_tables(schema_name):

        cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS {schema_name}.Dates (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL UNIQUE
        )
        ''')
        cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS {schema_name}.Scans (
            id SERIAL PRIMARY KEY,
            date_id INTEGER NOT NULL,
            patient_id TEXT NOT NULL,
            patient_name TEXT NOT NULL,
            start_time TIME NOT NULL,
            scan_length REAL NOT NULL,
            protocol TEXT NOT NULL,
            scan_type TEXT NOT NULL,
            other_info TEXT,
            FOREIGN KEY (date_id) REFERENCES {schema_name}.Dates(id)
        )
        ''')
        cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS {schema_name}.Timings (
            id SERIAL PRIMARY KEY,
            times FLOAT8[] NOT NULL,
            date_id INTEGER NOT NULL,
            FOREIGN KEY (date_id) REFERENCES {schema_name}.Dates(id)
        )
        ''')
        cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS {schema_name}.Efficiencies (
            id SERIAL PRIMARY KEY,
            efficiency FLOAT NOT NULL,
            date_id INTEGER NOT NULL,
            FOREIGN KEY (date_id) REFERENCES {schema_name}.Dates(id)
        )
        ''')

        conn.commit()

    create_schema(schema_name)
    create_tables(schema_name)

    cursor.close()
    conn.close()



def add_to_db(data):

    # PostgreSQL connection parameters
    dbname = 'mriutilisation'
    user = 'mridevs'
    password = 'qwer1234'
    host = 'localhost'  # or your PostgreSQL server IP address
    port = '5432'  # default PostgreSQL port

    # Connect to the PostgreSQL database
    conn = psycopg2.connect(
        dbname=dbname,
        user=user,
        password=password,
        host=host,
        port=port
    )
    cursor = conn.cursor()


    # Function to insert a date and get its id within a schema
    def get_or_create_date(schema_name, date):
        # print(f'Getting or creating date {date} in schema {schema_name}...')
        cursor.execute(f'SELECT id FROM {schema_name}.Dates WHERE date = %s', (date,))
        date_id = cursor.fetchone()
        if date_id:
            return date_id[0]
        cursor.execute(f'INSERT INTO {schema_name}.Dates (date) VALUES (%s) RETURNING id', (date,))
        conn.commit()
        date_identification = date_id

        return cursor.fetchone()[0]


    # Function to insert scan data within a schema
    def insert_scan(schema_name, date, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info=None):
        date_id = get_or_create_date(schema_name, date)
        cursor.execute(f'''
        INSERT INTO {schema_name}.Scans (date_id, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (date_id, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info))
        conn.commit()

    # Function to insert timings within a schema
    def insert_timings(schema_name, date, times):
        date_id = get_or_create_date(schema_name, date)
        cursor.execute(f'''
        INSERT INTO {schema_name}.Timings (date_id, times)
        VALUES (%s, %s)
        ''', (date_id, times))
        conn.commit()


    # Function to insert efficiency within a schema
    def insert_efficiency(schema_name, date, efficiency):
        date_id = get_or_create_date(schema_name, date)
        cursor.execute(f'''
        INSERT INTO {schema_name}.Efficiencies (date_id, efficiency)
        VALUES (%s, %s)
        ''', (date_id, efficiency))
        conn.commit()


    # Process the data
    if len(data) == 1:
        for record in data:
            schema_name, date, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info, times = record
            insert_scan(schema_name, date, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info)
            insert_timings(schema_name, date, times)
    else:
        insert_efficiency(data[0], data[1], data[2])

    # # Query data to check insertion (example for one schema)
    # schema_name = data[0][0]
    # print(f'Querying data from schema {schema_name}...')
    # cursor.execute(f'''
    # SELECT Dates.date, Scans.patient_id, Scans.patient_name, Scans.start_time, Scans.scan_length, Scans.protocol, Scans.scan_type, Scans.other_info
    # FROM {schema_name}.Scans
    # JOIN {schema_name}.Dates ON Scans.date_id = Dates.id
    # ''')
    # rows = cursor.fetchall()
    # for row in rows:
    #     print(row)

    # Close the connection
    cursor.close()
    conn.close()





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
#         CREATE TABLE IF NOT EXISTS {schema_name}.Timings (
#             id SERIAL PRIMARY KEY,
#             date_id INTEGER NOT NULL,
#             times FLOAT8[] NOT NULL
#             FOREIGN KEY (date_id) REFERENCES {schema_name}.Timings(id)
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
#         VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
#         ''', (date_id, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info))
#         conn.commit()
#
#     # Process the data
#     for record in data:
#         schema_name, date, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info = record
#         create_schema(schema_name)
#         create_tables(schema_name)
#         insert_scan(schema_name, date, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info)
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
# def store_timings_list(floats_list, date_id, schema_name):
#     # PostgreSQL connection parameters
#     dbname = 'mriutilisation'
#     user = 'mridevs'
#     password = 'qwer1234'
#     host = 'localhost'
#     port = '5432'
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
#     try:
#         # SQL command to insert the list of floats and date_id
#         insert_query = sql.SQL("""
#             INSERT INTO {schema}.timings (times, date_id)
#             VALUES (%s, %s)
#         """).format(schema=sql.Identifier(schema_name))
#
#         # Execute the insert command
#         cursor.execute(insert_query, (floats_list, date_id))
#
#         # Commit the transaction
#         conn.commit()
#
#     except Exception as e:
#         print(f"An error occurred: {e}")
#         # Rollback in case of an error
#         conn.rollback()
#
#     finally:
#         # Close the cursor and the connection
#         cursor.close()
#         conn.close()
#
