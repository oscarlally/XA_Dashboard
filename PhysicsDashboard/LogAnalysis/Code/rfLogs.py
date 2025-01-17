from parameter_lists import sequence_list, b1_list, sed_list, sar_list
from misc_functions import check_prev_day
from run_function import rf_log_analysis
from datetime import datetime, timedelta
from run_bash import call_bash_script
from getExam import extract_exam
import pandas as pd
import subprocess
import time
import os

shared_dir = "/Users/radiologyadmin/Documents/MRI_Scanner_Shared/"

dashboard_dir = "/Users/radiologyadmin/Documents/PhysicsDashboard/tailwind-dashboard-template-main/data/"

scanners = ["SMRVID"]


#data_type = input("Please type in the data you wish to check:  ")
data_type = 'sequence'

"Get the data that you want"
parameter_list = eval(f"{data_type}_list")


for i in scanners:

    data_path = f"/{shared_dir}Physics/zzzRF/Data/Scanners/{i}/"

    current_date = datetime.now()

    formatted_date = current_date.strftime("%d-%m-%y")

    flat_date = current_date.strftime("%d_%m_%Y")

    today_path = f"{data_path}{formatted_date}"

    if os.path.exists(today_path) and os.path.isdir(today_path):
        print('Log files found')

        # Filter and sort RF log files
        rf_log_file_paths_pre = [os.path.join(today_path, filename) for filename in os.listdir(today_path) if filename.startswith("RFSWD") and os.path.isfile(os.path.join(today_path, filename))]
        rf_log_files = sorted(rf_log_file_paths_pre, key=lambda path: os.path.getmtime(path))

        # Filter and sort GW log files
        gw_log_file_paths_pre = [os.path.join(today_path, filename) for filename in os.listdir(today_path) if filename.startswith("GSWD") and os.path.isfile(os.path.join(today_path, filename))]
        gw_log_files = sorted(gw_log_file_paths_pre, key=lambda path: os.path.getmtime(path))

        # Filter and sort APO log files
        prot_log_file_paths_pre = [os.path.join(today_path, filename) for filename in os.listdir(today_path) if filename.startswith("ProtocolService") and os.path.isfile(os.path.join(today_path, filename))]
        prot_log_files = sorted(prot_log_file_paths_pre, key=lambda path: os.path.getmtime(path))

        # Filter and sort Temp log files
        temp_log_file = [os.path.join(today_path, filename) for filename in os.listdir(today_path) if filename.startswith("PerAirTemp") and os.path.isfile(os.path.join(today_path, filename))]

        # Filter and sort Seso log files
        seso_log_file = [os.path.join(today_path, filename) for filename in os.listdir(today_path) if filename.startswith("MrSeso") and os.path.isfile(os.path.join(today_path, filename))]


    else:

        print('No current files uploaded')

        rf_log_files = []
        gw_log_files = []
        apo_log_files = []
        temp_log_file = []
        seso_log_file = []

    #try: 
        
    #    if len(temp_log_file) != 0:

    #        output_file = f"{dashboard_dir}temp/{i}/temp_data_{flat_date}.json"

    #        script_name = "cplusfunctions"

    #        call_bash_script(script_name, temp_log_file[0], output_file, 'TempHum')

    #except Exception as e:

    #    print(f"An error occurred: {e}")

    
    if len(rf_log_files) != 0:

        total_times = []

        exams = []

        figure_folder = None

        b1_data = None

        table_rows = None

        body_type = None

        dataset_no = 1

        for idx, (j, k) in enumerate(zip(rf_log_files, prot_log_files)):

            exams.append(extract_exam(k))

            if '.log' in j:

                if 'sequence' in data_type:

                    total_time = rf_log_analysis(formatted_date, i, data_type, parameter_list, j, body_type, dataset_no)

                    dataset_no = dataset_no + 1

                    total_times.append(total_time)

                    print('Sequence List Ran')

#                elif 'b1' in data_type:
#
#                    # body_type = input('What body part would you like to monitor B1+RMS and SAR?:  ')
#                    body_type = 'head'
#
#                    b1_dfs, table_rows = rf_log_analysis(data_type, parameter_list, j, body_type)
#
#                    if not b1_dfs.empty:
#
#                        if idx == 0:
#
#                            b1_data = b1_dfs
#
#                        else:
#
#                            b1_data = pd.concat([b1_data, b1_dfs], ignore_index=False)
#
#                    else:
#
#                        pass
#
#                else:
#
#                    rf_log_analysis(data_type, parameter_list, j, body_type)

#        print(exams)
        print(sum(total_times))



        # Code to get utilisation data from json analysis

        #json_seq_base = f"/Users/radiologyadmin/Documents/PhysicsDashboard/LogAnalysis/ScannerData/{i}/{flat_date}/DictFolder/sequence"
        #output_util = f"{dashboard_dir}utilisation/{i}/utilisation_data_{flat_date}.json"
        #script_name = "cplusfunctions"
        #call_bash_script(script_name, json_seq_base, output_util, 'Utilisation')




