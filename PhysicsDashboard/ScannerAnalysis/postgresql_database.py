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
            efficiency_workday FLOAT NOT NULL,
            date_id INTEGER NOT NULL,
            FOREIGN KEY (date_id) REFERENCES {schema_name}.Dates(id)
        )
        ''')
        cursor.execute(f'''
        CREATE TABLE IF NOT EXISTS {schema_name}.Weather (
            id SERIAL PRIMARY KEY,
            temperature FLOAT NOT NULL,
            humidity FLOAT NOT NULL,
            board_temperature FLOAT NOT NULL,
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
    def insert_efficiency(schema_name, date, efficiency, efficiency_workday):
        date_id = get_or_create_date(schema_name, date)
        cursor.execute(f'''
        INSERT INTO {schema_name}.Efficiencies (date_id, efficiency, efficiency_workday)
        VALUES (%s, %s, %s)
        ''', (date_id, efficiency, efficiency_workday))
        conn.commit()


    # Function to insert efficiency within a schema
    def insert_weather(schema_name, date, temperature, humidity, board_temperature):
        date_id = get_or_create_date(schema_name, date)
        cursor.execute(f'''
        INSERT INTO {schema_name}.Weather (date_id, temperature, humidity, board_temperature)
        VALUES (%s, %s, %s, %s)
        ''', (date_id, temperature, humidity, board_temperature))
        conn.commit()


    # Process the data
    if len(data) == 1:
        for record in data:
            schema_name, date, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info, times = record
            insert_scan(schema_name, date, patient_id, patient_name, start_time, scan_length, protocol, scan_type, other_info)
            insert_timings(schema_name, date, times)
    else:
        insert_efficiency(data[0], data[1], data[2], data[3])
        insert_weather(data[0], data[1], data[4], data[5], data[6])
