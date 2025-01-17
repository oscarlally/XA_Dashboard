from datetime import datetime, timedelta
import sqlite3
import pandas as pd


def view_data_for_date(date, db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    query = '''
    SELECT Dates.date, Scans.patient_id, Scans.scan_length, Scans.scan_type, Scans.other_info
    FROM Scans
    JOIN Dates ON Scans.date_id = Dates.id
    WHERE Dates.date = ?
    '''
    df = pd.read_sql_query(query, conn, params=(date,))
    conn.close()
    return df


def get_sqlite_structure(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get all table names
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    for table in tables:
        table_name = table[0]
        print(f"\nTable: {table_name}")

        # Get column information
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()

        for column in columns:
            print(f"  Column: {column[1]}")
            print(f"    Type: {column[2]}")
            print(f"    Nullable: {not column[3]}")
            if column[5]:
                print(f"    Primary Key: Yes")

        # Get foreign key information
        cursor.execute(f"PRAGMA foreign_key_list({table_name})")
        foreign_keys = cursor.fetchall()

        for fk in foreign_keys:
            print(f"  Foreign Key:")
            print(f"    Column: {fk[3]}")
            print(f"    References: {fk[2]}({fk[4]})")

    conn.close()


def get_scans_by_body_part_and_date_range(db_path, body_part, start_date, end_date):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    query = """
    SELECT DISTINCT
        s.patient_name,
        d.date,
        s.scan_length
    FROM 
        Scans s
    JOIN 
        Dates d ON s.date_id = d.id
    WHERE 
        (s.scan_type LIKE ? OR s.protocol LIKE ? OR s.other_info LIKE ?)
        AND d.date BETWEEN ? AND ?
    ORDER BY 
        d.date, s.patient_name;
    """

    # Create the LIKE pattern
    like_pattern = f'%{body_part}%'

    try:
        cursor.execute(query, (like_pattern, like_pattern, like_pattern, start_date, end_date))
        results = cursor.fetchall()
        conn.commit()  # Commit changes if any
        return results
    except sqlite3.Error as e:
        print(f"Error executing query: {e}")
        return None
    finally:
        conn.close()


# Initiate parameters
current_date = datetime.now()
previous_date = current_date - timedelta(days=14)
date_to_view = previous_date.strftime('%d-%m-%Y')
db_path = "/Users/oscarlally/Desktop/sql/scanning_data.db"
body_part = "Knee"
date_1 = '10-06-24'
date_2 = '09-07-24'

# Get db structure
get_sqlite_structure(db_path)

# Print db by date
df = view_data_for_date(date_to_view, db_path)

# Get all knee scans

scans = get_scans_by_body_part_and_date_range(db_path,
                                              body_part,
                                              date_1,
                                              date_2)

averages = []
for scan in scans:
    averages.append(scan[2])
    print(f"Patient: {scan[0]}, Date: {scan[1]}, Scan Length: {scan[2]}")

# print('Average', body_part, 'time from', date_1, 'to', date_2, 'is', sum(averages)/len(averages), 'minutes')


