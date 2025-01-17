from extract import split_list_into_sections, \
                    split_sections_into_programs, \
                    filter_utilization_event_lines, \
                    generate_combination, \
                    parse_sections, \
                    time_difference_in_minutes, \
                    time_to_float, \
                    float_to_time
from postgresql_database import initialise_db, add_to_db
from patient_details import get_patient_details
from environment_details import get_weather
from datetime import datetime, timedelta
from workday import workday
import os


scanners = ['smrvid', 'gmri3', 'emri1', 'gmri4']
current_date = datetime.now()
formatted_previous_date = current_date.strftime('%Y-%m-%d')
file_date = current_date.strftime('%d-%m-%y')

print(formatted_previous_date, file_date)

for scanner in scanners:
    
    initialise_db(scanner)

    folder = f'/Users/radiologyadmin/Documents/MRI_Scanner_Shared/Physics/zzzRF/Data/Scanners/{scanner.upper()}/{file_date}'
    file_path = f"{folder}/UtilizationEvents.txt"
    if os.path.exists(folder) and os.path.isdir(folder):
        num_files = len([file for file in os.listdir(folder) if os.path.isfile(os.path.join(folder, file))])
        if num_files > 6:

            final_rf_info = get_patient_details(folder)
            temp, hum, board_temp = get_weather(folder)
            day_list = filter_utilization_event_lines(file_path, formatted_previous_date)


            sections, failed_sections = split_list_into_sections(day_list)


            efficiency_data = 0
            eight_data = []
            overall_start = None
            overall_end = None
            total_time = []
            patients = {}

            for idx, section in enumerate(sections):

                check_sections, check_failed_sections = split_sections_into_programs(section)

                if len(check_sections) != 1:

                    print('ADDED PROGRAM', len(check_sections))

                    for k in range(1, len(check_sections)):

                        sections.insert(idx+1, check_sections[k])

                time = parse_sections(patients, section, idx + 1, generate_combination(), final_rf_info)

                if time is not None:

                    simple_time = [time[0], time[1], time[-2], time[-1]]

                    total_time.append(time)
                    

                # Accessing a specific patient instance
                patient_instance = patients[f'patient_{idx+1}']
                if idx == 0:
                    overall_start = patient_instance.start
                if idx == len(sections) - 1:
                    print(time_to_float(patient_instance.start))
                    overall_end = float_to_time(time_to_float(patient_instance.start) + float(patient_instance.total)/60)
                if patient_instance.failed is None:
                    efficiency_data = efficiency_data + float(patient_instance.total)
                    print('--------------------------')
                    print(f"Patient Number {idx+1}")
                    print('Patient Name:', patient_instance.name)
                    print('Patient Age:', patient_instance.age)
                    print('Patient Sex:', patient_instance.sex)
                    print('Start time:', patient_instance.start)
                    print('Total time of scan:', f"{patient_instance.total} mins")
                    print('Protocol(s) ran:', patient_instance.sequences)
                    print('Changed sequence(s):', patient_instance.notes)
                    print('Error log:', patient_instance.logerror)
                    eight_data.append([patient_instance.start, patient_instance.total])
                else:
                    print('--------------------------')
                    print(f"Patient Number {idx+1}")
                    print('Patient Name:', patient_instance.name)
                    print('Scan failed:', patient_instance.failed)

                print(section)

                sql_notes = patient_instance.notes[0] if len(patient_instance.notes) != 0 else 'Nothing'
                sql_sequences = patient_instance.sequences[0] if len(patient_instance.sequences) != 0 else 0
                sql_total = float(patient_instance.total) if patient_instance.total is not None else None

                if sql_total:

                    data = [(scanner, formatted_previous_date, patient_instance.index, patient_instance.name,
                             patient_instance.start, sql_total,
                             sql_sequences, 'MRI', sql_notes, simple_time)]

                    add_to_db(data)
            


            print('------------------------')
            print(overall_start, overall_end)
            if overall_start is None or overall_end is None:
                total_on = 0
            else:
                total_day_time = time_difference_in_minutes(overall_start, overall_end)
                total_on = round(100*efficiency_data/total_day_time, 1)

            print(temp, hum, board_temp)
            total_on_workday = round(workday(eight_data), 1)

            add_to_db([scanner, formatted_previous_date, total_on, total_on_workday, float(temp), float(hum), float(board_temp)])




