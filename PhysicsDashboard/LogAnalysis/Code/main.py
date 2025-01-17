from extract import split_file_into_days, split_list_into_sections, parse_utilization_events, update_json_file
from parameter_lists import sequence_list, b1_list, sed_list, sar_list
from misc_functions import check_prev_day
from run_function import rf_log_analysis
from datetime import datetime, timedelta
from run_bash import call_bash_script
from getExam import extract_exam
import pandas as pd
import subprocess
import time
import json
import os

shared_dir = "/Users/radiologyadmin/Documents/MRI_Scanner_Shared/"

dashboard_dir = "/Users/radiologyadmin/Documents/PhysicsDashboard/tailwind-dashboard-template-main/data/"

scanners = ["SMRVID", "EMRI1"]

# day = "22"

for i in scanners:

    data_path = f"{shared_dir}Physics/zzzRF/Data/Scanners/{i}/"

    current_date = datetime.now()

    formatted_date = current_date.strftime("%d-%m-%y")
    # formatted_date = f"{day}-04-24"

    flat_date = current_date.strftime("%d_%m_%Y")
    # flat_date = f"{day}_04_2024"

    cdate = current_date.strftime("%Y/%m/%d")
    # cdate = f"2024/04/{day}"

    today_path = f"{data_path}{formatted_date}"

    if os.path.exists(today_path) and os.path.isdir(today_path):
        print('Log files found')

        # Filter and sort RF log files
        rf_log_file_paths_pre = [os.path.join(today_path, filename) for filename in os.listdir(today_path) if filename.startswith("RFSWD") and os.path.isfile(os.path.join(today_path, filename))]
        rf_log_files = sorted(rf_log_file_paths_pre, key=lambda path: os.path.getmtime(path))

        # Filter and sort GW log files
        gw_log_file_paths_pre = [os.path.join(today_path, filename) for filename in os.listdir(today_path) if filename.startswith("GSWD") and os.path.isfile(os.path.join(today_path, filename))]
        gw_log_files = sorted(gw_log_file_paths_pre, key=lambda path: os.path.getmtime(path))

        # Filter and sort Temp log files
        temp_log_file = [os.path.join(today_path, filename) for filename in os.listdir(today_path) if filename.startswith("PerAirTemp") and os.path.isfile(os.path.join(today_path, filename))]

        # Filter and sort Seso log files
        seso_log_file = [os.path.join(today_path, filename) for filename in os.listdir(today_path) if filename.startswith("MrSeso") and os.path.isfile(os.path.join(today_path, filename))]

        # Filter and sort Seso log files
        util_file = [os.path.join(today_path, filename) for filename in os.listdir(today_path) if filename.startswith("Utilization") and os.path.isfile(os.path.join(today_path, filename))]


    else:

        print('No current files uploaded')

        rf_log_files = []
        gw_log_files = []
        apo_log_files = []
        temp_log_file = []
        seso_log_file = []

    try: 
    
        if len(util_file) != 0:

            base_path = f"/Users/radiologyadmin/Documents/PhysicsDashboard/LogAnalysis/ScannerData/{i}/UtilisationLists/{flat_date}/"

            # Create directory if it doesn't exist
            if not os.path.exists(base_path):
                os.makedirs(base_path)

            path_anat = f"{dashboard_dir}scanLengths/anatomyLength.json"

            days = split_file_into_days(util_file[0])

            sections = split_list_into_sections(days[-1])

            total_time = []
            patients = {}

            for idx, section in enumerate(sections):

                events, time, message = parse_utilization_events(patients, section, idx+1)

                if events is not None:

                    if idx == len(sections)-1:
                        time.pop()

                    total_time.append(time)

                    # Accessing a specific patient instance
                    patient_instance = patients[f'patient_{idx+1}']
                    print('--------------------------')
                    print(f"Patient Number {idx+1}")
                    print(patient_instance.start)
                    print(f"{patient_instance.total} mins")
                    print(patient_instance.sequences)
                    print('Changed sequence(s)', patient_instance.notes)

                    print(path_anat, patient_instance.sequences[0], patient_instance.total)

                    update_json_file(path_anat, str(patient_instance.sequences[0]), float(patient_instance.total))




            for k in range(len(total_time)-1):
                last_two = total_time[k+1][0:2]
                if 0 in last_two:
                    last_two = [last_two[1]]
                total_time[k].extend(last_two)
                print(total_time[k])

            file_path_dict = {"data": []}

            for idx, times in enumerate(total_time):

                data_dict = {"data": times}

                # Specify the file path
                file_path = f"{base_path}{idx+1}.json"
                file_path_dict["data"].append(file_path)

                # Write the list to a JSON file
                with open(file_path, "w") as json_file:
                    json.dump(data_dict, json_file)


            # Write the list to a JSON file
            with open(f"{base_path}info.json", "w") as json_file:
                json.dump(file_path_dict, json_file)

            # Run the c++ analysis for the utilisation file
            cpp_executable_path = '/Users/radiologyadmin/CLionProjects/utilisationAnalysis/cmake-build-debug/utilisationAnalysis'
            process = subprocess.Popen([cpp_executable_path, flat_date], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate()

            # Print the output
            if stdout:
                print("Output:", stdout.decode())
            if stderr:
                print("Error:", stderr.decode())


    except Exception as e:

       print(f"An error occurred: {e}")


    try: 
        
       if len(temp_log_file) != 0:

           output_file = f"{dashboard_dir}temp/{i}/temp_data_{flat_date}.json"

           script_name = "cplusfunctions"

           call_bash_script(script_name, cdate, temp_log_file[0], output_file, 'TempHum')

    except Exception as e:

       print(f"An error occurred: {e}")


    # try:

    #     if len(rf_log_files) != 0:

    #         output_dir = "/Users/radiologyadmin/Documents/PhysicsDashboard/tailwind-dashboard-template-main/data/dayInfo";

    #         input_dir = f"/Users/radiologyadmin/Documents/PhysicsDashboard/LogAnalysis/ScannerData/{i}/{formatted_date}/DictFolder/sequence"

    #         script_name = "MRIDataAnalysis_V2"

    #         subprocess.run([f"./{script_name}.sh", i, input_dir, output_dir], check=True)

    # except Exception as e:

    #     print(f"An error occurred: {e}")









