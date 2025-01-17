from patient_details import find_closest_time_index
from datetime import datetime, timedelta
import decimal
import random
import string
import pytz
import math
import json
import re
import os


def generate_combination():
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(10))


class Patient:
    def __init__(self, index, name):
        self.index = index
        self.name = name
        self.age = None
        self.sex = None
        self.weight = None
        self.height = None
        self.contrast = None
        self.start = None
        self.total = None
        self.sequences = []
        self.notes = []
        self.logerror = False
        self.failed = None

    def add_sequence(self, sequence):
        self.sequences.append(sequence)

    def add_notes(self, note):
        self.notes.append(note)


def is_bst():
    # Get current UTC time
    utc_now = datetime.utcnow()

    # Get timezone information for UK
    uk_timezone = pytz.timezone('Europe/London')

    # Convert current UTC time to UK time
    uk_now = utc_now.replace(tzinfo=pytz.utc).astimezone(uk_timezone)

    # Check if the current date is in BST
    return uk_now.dst() != 0


def round_to_3sf(number):
    # Convert the number to a Decimal object
    decimal_number = decimal.Decimal(str(number))

    # Round the number to 3 significant figures
    rounded_number = decimal_number.quantize(decimal.Decimal('0.001'), rounding=decimal.ROUND_HALF_UP)

    return rounded_number


def split_between_characters(sentence, start_char, end_char):
    # Construct the regular expression pattern
    pattern = re.escape(start_char) + "(.*?)" + re.escape(end_char)

    # Find all matches of the pattern in the sentence
    matches = re.findall(pattern, sentence)

    return matches


def convert_time_to_decimal(time_str):
    try:
        time_obj = datetime.strptime(time_str, '%Y-%m-%d %H:%M:%SZ')
        if is_bst():
            decimal_time = time_obj.hour + 1 + time_obj.minute / 60.0 + time_obj.second / 3600.0
        else:
            decimal_time = time_obj.hour + time_obj.minute / 60.0 + time_obj.second / 3600.0
        return decimal_time
    except ValueError:
        print(f"Error: Invalid time format - {time_str}")
        return None


def float_to_time(float_time):
    hour = math.floor(float_time)
    minute = 60*(float_time-hour)
    return f"{int(hour):02d}:{int(minute):02d}"


def check_mode(x):
    if x in [0, 1]:
        return True


def update_json_file(file_path, key, value):
    try:
        with open(file_path, 'r') as file:
            file_content = file.read()
            if file_content.strip():  # Check if the file is not empty
                data = json.loads(file_content)
            else:
                data = {}
    except (FileNotFoundError, json.JSONDecodeError):
        data = {}

    # Check if the key is already present and update the data accordingly
    if key in data:
        if isinstance(data[key], list):
            data[key].append(value)
        else:
            data[key] = [data[key], value]
    else:
        data[key] = [value]

    # Write the updated data back to the JSON file
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)



def filter_utilization_event_lines(input_file, date):

    key_words = ['preparation', 'measurement', 'Load', 'Add', 'Delete']

    with open(input_file, 'r') as infile:
        lines = infile.readlines()

    filtered_lines = []
    i = 0
    while i < len(lines):
        if '<Event type="UtilizationEvent" name ="Utilization"' in lines[i] and \
                date in lines[i] and \
                any(element in lines[i+1] for element in key_words):
            filtered_lines.append(lines[i])
            if i + 1 < len(lines):
                filtered_lines.append(lines[i + 1])
            i += 2  # Skip the next line as it's already included
        else:
            i += 1

    def remove_empty(original_list):
        return list(filter(lambda x: x != "", original_list))

    return remove_empty(filtered_lines)


def split_list_into_sections(lines):
    sections = []
    current_section = []
    failed_section = []

    for i, line in enumerate(lines):
        if '<Event type="UtilizationEvent" name ="Utilization"' in line:
            next_line = lines[i + 1] if i + 1 < len(lines) else None
            if next_line and ('Load workflow' in next_line):
            # if next_line and ('Load workflow' in next_line or 'Load program' in next_line):
                if current_section and len(current_section) > 2:
                    sections.append(current_section)
                elif current_section and len(current_section) <= 2:
                    failed_section.append(current_section)
                current_section = [line.strip(), next_line.strip()]
            else:
                current_section.append(line.strip())
                if next_line:
                    current_section.append(next_line.strip())
    if current_section:
        sections.append(current_section)

    return sections, failed_section


def split_sections_into_programs(lines):
    sections = []
    current_section = []
    failed_section = []

    for i, line in enumerate(lines):
        if '<Event type="UtilizationEvent" name ="Utilization"' in line:
            next_line = lines[i + 1] if i + 1 < len(lines) else None
            if next_line and ('Load workflow' in next_line or 'Load program' in next_line):
            # if next_line and ('Load workflow' in next_line or 'Load program' in next_line):
                if current_section and len(current_section) > 2:
                    sections.append(current_section)
                elif current_section and len(current_section) <= 2:
                    failed_section.append(current_section)
                current_section = [line.strip(), next_line.strip()]
            else:
                current_section.append(line.strip())
                if next_line:
                    current_section.append(next_line.strip())
    if current_section:
        sections.append(current_section)

    return sections, failed_section


def get_time(event):
    start = event[0].index('time="') + len('time="')
    end = event[0].index('"', start)
    time = event[0][start:end]
    return convert_time_to_decimal(time)


def get_message(event):
    start = event[1].index('>') + 1
    end = event[1].rindex('<')
    message = event[1][start:end]
    split_message = split_between_characters(message, '&lt;', ' &gt;')
    return message, split_message


def find_message_in_string(possible_messages, input_string):
    for index, message in enumerate(possible_messages):
        if message in input_string:
            return index
    return -1  # Return -1 if no message is found in the string


def parse_sections(patients, section, patient_idx, patient_id, final_info):

    patients[f"patient_{patient_idx}"] = Patient(patient_idx, patient_id)

    sequences_ran = []

    if 'Load' in section[1] and len(section) < 5:

        patients[f"patient_{patient_idx}"].failed = f"Exam Failed.  Likely DNA or incorrect protocol loaded"

        return None

    possible_messages = ['Start preparation',
                         'Start measurement',
                         'Stop preparation',
                         'Stop measurement',
                         'Add ',
                         'Delete ',
                         'Load workflow',
                         'Load program']

    final_timings = []
    message_type = -1

    timings = []
    message = []

    for i in range(0, len(section)-1, 2):
        timings.append(section[i])
        message.append(section[i+1])

    for idx, event in enumerate(zip(timings, message)):

        time = get_time(event)
        message, split_message = get_message(event)

        type_index = find_message_in_string(possible_messages, message)

        if type_index == 6:
            exam = split_message[0].strip()
            relative_path_pre = exam.split('/')[1:]
            separator = ' - '  # You can use any separator you like
            relative_path = separator.join(relative_path_pre)
            if relative_path == '':
                patients[f"patient_{patient_idx}"].add_sequence('New Program')
            else:
                patients[f"patient_{patient_idx}"].add_sequence(relative_path)

        elif 3 < type_index < 6:
            patients[f"patient_{patient_idx}"].add_notes(message)

        elif type_index == 0:
            if type_index != message_type:
                message_type = type_index
                final_timings.append(type_index)
                final_timings.append(time)
            else:
                final_timings.pop()
                final_timings.pop()
                patients[f"patient_{patient_idx}"].add_notes(f"Sequence repeated: {split_message[0]}")

        elif type_index == 2:
            final_timings.append(time)
            final_timings.append(2)

        elif type_index == 1:
            sequences_ran.append(split_message[0])
            if type_index != message_type:
                message_type = type_index
                final_timings.append(type_index)
                final_timings.append(time)
            else:
                final_timings.pop()
                final_timings.pop()
                patients[f"patient_{patient_idx}"].add_notes(f"Sequence repeated: {split_message[0]}")

        elif type_index == 3:
            final_timings.append(time)
            final_timings.append(2)

    if len(final_timings) < 3:
        del patients[f"patient_{patient_idx}"]
        patients[f"patient_{patient_idx}"] = Patient(patient_idx, patient_id)
        patients[f"patient_{patient_idx}"].failed = True
        return None

    if len(final_timings) >= 3:
        if final_timings[-1] == 2:
            final_timings.pop()
        if final_timings[0] != 0 and final_timings[0] != 1:
            final_timings.insert(0, final_timings[0] - 0.09)
            final_timings.insert(0, 0)
            patients[f"patient_{patient_idx}"].logerror = f"First sequence not encapsulated"
            patients[f"patient_{patient_idx}"].add_sequence("Undefined, but sequence order is:")
            patients[f"patient_{patient_idx}"].add_sequence(sequences_ran)
        patients[f"patient_{patient_idx}"].start = f"{float_to_time(final_timings[1])}"
        patients[f"patient_{patient_idx}"].total = f"{round_to_3sf(60* (final_timings[-1] - final_timings[1]))}"
        if final_info is not None:
            index = find_closest_time_index(final_info, f"{float_to_time(final_timings[1])}")
            patient_deets = final_info[index]
            patients[f"patient_{patient_idx}"].age = patient_deets[1].strip()
            patients[f"patient_{patient_idx}"].height = patient_deets[2].strip()
            patients[f"patient_{patient_idx}"].weight = patient_deets[3].strip()
            patients[f"patient_{patient_idx}"].sex = patient_deets[4].strip()
        final_timings.append(3)
        return final_timings


def get_subfolders(folder):
    subfolders = [f.path for f in os.scandir(folder) if f.is_dir()]
    return subfolders


def time_difference_in_minutes(time1, time2):
    # Convert string times to datetime objects
    t1 = datetime.strptime(time1, "%H:%M")
    t2 = datetime.strptime(time2, "%H:%M")

    # Calculate the difference
    time_diff = t2 - t1

    # If the result is negative, add 24 hours
    if time_diff.days < 0:
        time_diff = timedelta(days=1) + time_diff

    # Convert the difference to minutes
    minutes = time_diff.seconds / 60

    return int(minutes)


def time_to_float(time):
    components = time.split(':')
    return float(components[0]) + float(components[1])/60


