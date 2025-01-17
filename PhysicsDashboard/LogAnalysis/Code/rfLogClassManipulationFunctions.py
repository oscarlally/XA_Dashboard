import re
from misc_functions import get_total_meas_time

special_values = [["readout_and_check_time_bb",
                   "start_of_measurement_host_time",
                   "finish_of_measurement_host_time",
                   "start_of_measurement_mcir_time",
                   "finish_of_measurement_mcir_time"],
                  ["patient_weight", "patient_height"],
                  "date_and_time"]

flatten_pre = [item if isinstance(item, list) else [item] for item in special_values]
flatten_values = [item for sublist in flatten_pre for item in sublist]


def find_target_character(file_path, target_character, split_char):
    x = None
    lines_dict = {}
        
    target_words = target_character.split('_')
    is_inside = False
    extracted_lines = []

    with open(file_path, 'r') as file:
        for line in file:
            if is_inside:
                extracted_lines.append(line)
                if not line.startswith(' '):
                    is_inside = False
            elif all(word in line for word in target_words[1:-1]) and (target_words[-1] + '_.' in line) and (' ' + target_words[0] in line):
                is_inside = True
                extracted_lines.append(line)

    extracted_lines = extracted_lines[:-1]

    if len(extracted_lines) == 0:
        return 'No data', None

    elif len(extracted_lines) < 2:
        a = extracted_lines[0].strip()
        x = a.split(split_char, 1)[1]
        if x is None:
            return 'No Data', None
        else:
            return x.strip(), None

    else:
        for idx, line in enumerate(extracted_lines):
            if idx == 0:
                x = line[4:].split(split_char, 1)[0]
                x, _ = x.rsplit('_', 1)
                x = x.replace('.', '')
                y = line.split(split_char, 1)[1]
                lines_dict[x.strip()] = y.strip()
            else:
                x = line.split(split_char, 1)[0]
                x, _ = x.rsplit('_', 1)
                x = x.replace('.', '')
                y = line.split(split_char, 1)[1]
                lines_dict[x.strip()] = y.strip()

        return x, lines_dict  # Return values for the last iteration



def exceptions(value, value_name, class_dict):
    if value_name.strip() == "date_and_time":
        start_time = value.split('_')[1]
        time = str(start_time).split('.')[0]
        class_dict[f"{value_name}"] = f"{value}"
        class_dict[f"start_time"] = f"{time}"
    if value_name.strip() in special_values[0]:
        time = str(value).split('.')[0]
        class_dict[f"{value_name}"] = f"{time}"
    if value_name.strip() in special_values[1]:
        size = str(value).split('_')[0]
        class_dict[f"{value_name}"] = f"{size}"


def get_sequence_data(log_separated, csa_map):
    relevant_data = None
    data_list = []
    class_dict = {}
    for num, (key, value_name) in enumerate(csa_map.items()):
        if key.strip().isdigit():
            value, sub_values = find_target_character(log_separated, value_name, ":")
            if value_name.strip() in flatten_values:
                exceptions(value, value_name, class_dict)
            elif value_name != None:
                class_dict[f"{value_name}"] = f"{value}"
            if sub_values != None:
                class_dict = {**class_dict, **sub_values}


    for key, value in class_dict.items():
        data_list.append(value)

    relevant_data = class_dict

    total_measurement_time_str = relevant_data.get('total_measurement_time_host', '')

    print(relevant_data)

    total_meas = get_total_meas_time(relevant_data)

    return relevant_data, data_list, total_meas










