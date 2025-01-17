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
from datetime import datetime, timedelta


"""NEED TO SORT THE LOAD PROGRAM LOAD PROTOCOL PROBLEM, LOOK UP AMY109 on the 25th"""

scanner = 'smrvid'
current_date = datetime.now()
# previous_date = current_date - timedelta(days=38)
previous_date = current_date - timedelta(days=3)
formatted_previous_date = previous_date.strftime('%Y-%m-%d')
sql_date = previous_date.strftime('%d-%m-%Y')
initialise_db(scanner)

# folder = '/Users/oscarlally/Desktop/SMRVID/25-06-24'
folder = '/Users/radiologyadmin/Documents/MRI_Scanner_Shared/Physics/zzzRF/Data/Scanners/SMRVID/09-08-24'
path_anat = "/Users/oscarlally/Desktop/jsons/anat/anatomy.json"
base_path = "/Users/oscarlally/Desktop/jsons/util/"
db_path = "/Users/oscarlally/Desktop/sql"
file_path = f"{folder}/UtilizationEvents.txt"
final_info = get_patient_details(folder)

day_list = filter_utilization_event_lines(file_path, formatted_previous_date)

sections, failed_sections = split_list_into_sections(day_list)

# for i in sections:
    # print(len(sections))
    # print(i)
    # print(i[0])
    # print(i[1])
    # print(i[2])
    # print(i[-3])
    # print(i[-2])
    # print(i[-1])
    # print()

efficiency_data = 0
overall_start = None
overall_end = None
total_time = []
patients = {}

for idx, section in enumerate(sections):

    check_sections, check_failed_sections = split_sections_into_programs(section)

    if len(check_sections) != 1:

        sections.insert(idx+1, check_sections[1])

    time = parse_sections(patients, section, idx + 1, generate_combination(), final_info)

    simple_time = [time[0], time[1], time[-2], time[-1]]

    if time:
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
    else:
        print('--------------------------')
        print(f"Patient Number {idx+1}")
        print('Patient Name:', patient_instance.name)
        print('Scan failed:', patient_instance.failed)

    sql_notes = patient_instance.notes[0] if len(patient_instance.notes) != 0 else 'Nothing'
    sql_sequences = patient_instance.sequences[0] if len(patient_instance.sequences) != 0 else 0
    sql_total = float(patient_instance.total) if patient_instance.total is not None else None

    if sql_total:

        data = [(scanner, formatted_previous_date, patient_instance.index, patient_instance.name,
                 patient_instance.start, sql_total,
                 sql_sequences, 'MRI', sql_notes, simple_time)]

        add_to_db(data)

    # update_json_file(path_anat, str(patient_instance.sequences[0]), float(patient_instance.total))


total_day_time = time_difference_in_minutes(overall_start, overall_end)
total_on = round(100*efficiency_data/total_day_time, 1)

add_to_db([scanner, formatted_previous_date, total_on])



#
#
# total_time.pop()
# for i in range(len(total_time)-1):
#     last_two = total_time[i+1][0:2]
#     if 0 in last_two:
#         last_two = [last_two[1]]
#     total_time[i].extend(last_two)
#
# file_path_dict = {"data_complex": [],
#                   "data_simple": []}
#
# for idx, times in enumerate(total_time):
#
#     if times[-2] == 3:
#
#         simple_times = [*times[0:2], *times[-3:]]
#
#     else:
#
#         simple_times = [*times[0:2], *[times[-1]]]
#
#     simple_dict = {"data": simple_times}
#     complex_dict = {"data": times}
#
#



#     # Specify the file path
#     file_path_times = f"{base_path}times_{idx+1}.json"
#     file_path_simple = f"{base_path}simple_times_{idx + 1}.json"
#     file_path_dict["data_complex"].append(file_path_times)
#     file_path_dict["data_simple"].append(file_path_simple)
#
#     # Write the list to a JSON file
#     with open(file_path_simple, "w") as json_file:
#         json.dump(simple_dict, json_file)
#
#     # Write the list to a JSON file
#     with open(file_path_times, "w") as json_file:
#         json.dump(complex_dict, json_file)
#
#     day_end_time = total_time[-1]
#
# # Write the list to a JSON file
# with open(f"{base_path}info.json", "w") as json_file:
#     json.dump(file_path_dict, json_file)

