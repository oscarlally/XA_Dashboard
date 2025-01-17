import fnmatch
import os
import re


def get_specific_files(folder_path, search_string):
    matching_files = []
    for root, dirs, files in os.walk(folder_path):
        for filename in fnmatch.filter(files, f'*{search_string}*'):
            matching_files.append(os.path.join(root, filename))
    return matching_files


def extract_time(file_path):
    filename = os.path.basename(file_path)
    match = re.search(r'_(\d{2}_\d{2}_\d{2})\.log$', filename)
    if match:
        return match.group(1)
    return None


def time_to_tuple(time_str):
    return tuple(map(int, time_str.split('_')))


def remove_non_unique_lists(two_d_list):
    # Use a set to track unique lists
    seen = set()
    unique_lists = []

    for lst in two_d_list:
        # Convert the inner list to a tuple (because sets can't have lists)
        lst_tuple = tuple(lst)
        if lst_tuple not in seen:
            seen.add(lst_tuple)
            unique_lists.append(lst)

    return unique_lists


def search_info(file_path, search_string):
    with open(file_path, 'r') as file:
        lines = file.readlines()
        for line in lines:
            if search_string in line:
                if 'Time' not in search_string:
                    return line.strip().split(':')[-1]
                else:
                    end_string = line.strip().split('_')[-1]
                    return f"{end_string.split(':')[-3]}:{end_string.split(':')[-2]}"


def get_patient_details(folder_path):

    final_info = []
    remove_idx = []
    rf_log_string = 'RFSWD'
    files = get_specific_files(folder_path, rf_log_string)

    if len(files) == 0:
        return None

    sorted_files = sorted(files, key=lambda x: time_to_tuple(extract_time(x)))

    for idx, i in enumerate(sorted_files):
        if int(i.split('_')[-3]) < 6:
            remove_idx.append(idx)

    indexes_to_remove = sorted(remove_idx, reverse=True)
    for index in indexes_to_remove:
        if 0 <= index < len(sorted_files):  # Check if index is within the valid range
            sorted_files.pop(index)

    for path in sorted_files:

        age = search_info(path, 'Patient Age')
        height = search_info(path, 'Patient Height')
        weight = search_info(path, 'Patient Weight')
        sex = search_info(path, 'Patient Gender')
        time = search_info(path, 'Date & Time')

        args = [time, age, height, weight, sex]

        if any(arg is None for arg in args) == False:

            final_info.append([time, age.split(' ')[1], height.split(' ')[1], weight.split(' ')[1], sex])

    return remove_non_unique_lists(final_info)


"""MAY NEED TO BE AWARE THAT THIS COULD CAUSE ISSUES IF THERE ARE ISSUES IN THE LOG FILES"""


def find_closest_time_index(final_info, input_time):

    time_list = [sublist[0] for sublist in final_info if sublist]

    def time_to_minutes(time_str):
        hours, minutes = map(int, time_str.split(':'))
        return hours * 60 + minutes

    input_minutes = time_to_minutes(input_time)
    time_minutes = [time_to_minutes(t) for t in time_list]

    # Find the index of the closest time
    closest_index = min(range(len(time_minutes)), key=lambda i: abs(time_minutes[i] - input_minutes))

    return closest_index
