from parameter_lists import sequence_list, b1_list, sed_list, sar_list
from misc_functions import check_prev_day
from run_function import rf_log_analysis
from datetime import datetime, timedelta
from run_bash import call_bash_script
import pandas as pd
import subprocess
import time
import os

shared_dir = "/Users/radiologyadmin/Documents/MRI_Scanner_Shared/"

dashboard_dir = "/Users/radiologyadmin/Documents/PhysicsDashboard/tailwind-dashboard-template-main/data/"

scanners = ["SMRVID"]


flat_date = "08-04-24"
date = "08_04_2024"

# Code to get utilisation data from json analysis

json_seq_base = f"/Users/radiologyadmin/Documents/PhysicsDashboard/LogAnalysis/ScannerData/{scanners[0]}/{flat_date}/DictFolder/sequence"
output_util = f"{dashboard_dir}utilisation/{scanners[0]}/utilisation_data_{date}.json"
script_name = "cplusfunctions"
call_bash_script(script_name, json_seq_base, output_util, 'Utilisation')




