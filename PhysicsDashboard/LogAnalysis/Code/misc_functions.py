from datetime import datetime, timedelta
import json
import pickle
import os


def get_log_bases(data_dir):
    log_name = os.path.basename(data_dir).split('.')[0]
    data_path = f"{os.path.dirname(data_dir)}/Files/{log_name}"
    return data_path
       
    
def remove_dir(directory_path):
    if os.path.exists(directory_path) and os.path.isdir(directory_path):
        # Iterate through the files in the directory and remove them
        for root, dirs, files in os.walk(directory_path):
            for file in files:
                file_path = os.path.join(root, file)
                os.remove(file_path)


def check_prev_day(directory_path, current_date, formatted_date, apply):
    if not apply:
        return

    try:
        day_of_week = current_date.weekday()
        if day_of_week == 1:
            previous_work_day = current_date - timedelta(days=3)
            previous_formatted = previous_work_day.strftime("%d_%m_%Y")
        else:
            previous_work_day = current_date - timedelta(days=1)
            previous_formatted = previous_work_day.strftime("%d_%m_%Y")
        files_new = os.listdir(f"{directory_path}{formatted_date}")
        files_old = os.listdir(f"{directory_path}{previous_formatted}")
        file_paths_old = [
            os.path.join(directory_path, file)
            for file in files_old
            if os.path.isfile(os.path.join(directory_path, file))
        ]
        file_paths_new = [
            os.path.join(directory_path, file)
            for file in files_new
            if os.path.isfile(os.path.join(directory_path, file))
        ]

        if not file_paths_old:
            raise ValueError("No files found in the previous day folder")

        previous_file = max(file_paths_old, key=os.path.getctime)
        current_file = min(file_paths_new, key=os.path.getctime)

        num_lines = 500
        with open(previous_file, 'r') as file1, open(current_file, 'r') as file2:
            for line_number, (line1, line2) in enumerate(zip(file1, file2), 1):
                if line1 != line2:
                    pass
                elif line_number == num_lines:
                    os.remove(current_file)
    except FileNotFoundError:
        pass
    except ValueError as e:
        print(f"Error: {e}")


def get_total_meas_time(data_dict):
    
    # Extract the total measurement time value
    total_measurement_time_str = data_dict.get('total_measurement_time_host', '')

    # Check if the string contains numeric characters
    if any(char.isdigit() for char in total_measurement_time_str):
        # Get the total measurement time in seconds as a float
        total_measurement_time_sec = float(total_measurement_time_str[:-2])
        # Convert seconds to minutes (as a decimal)
        total_measurement_time_min = total_measurement_time_sec / 60
        return total_measurement_time_min
    else:
        return None


def save_obj_json(the_directory, the_object, idx):
    if isinstance(the_object, dict):
        name = the_object["protocol_name"]
        json_data = json.dumps(the_object, indent=4)
        with open(f"{the_directory}{name}_{idx}.json", 'w') as json_file:
            json_file.write(json_data)

def load_obj(the_directory, the_object):
    with open(f"{the_directory}{the_object.protocol_name}.pkl", 'rb') as file:
        loaded_obj = pickle.load(file)
        return loaded_obj

