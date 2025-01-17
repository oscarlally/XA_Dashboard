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
        self.contrast = None
        self.start = None
        self.total = None
        self.sequences = []
        self.notes = []

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
            if next_line and ('Load program' in next_line or 'Load workflow' in next_line):
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


def parse_sections(patients, section, patient_idx, patient_id):
    utilization_times = []
    messages = []

    patients[f"patient_{patient_idx}"] = Patient(patient_idx, patient_id)
    message_comp = None

    dec_time = None

    for line in section:
        if line.startswith('<Event type="UtilizationEvent" name ="Utilization"'):
            start = line.index('time="') + len('time="')
            end = line.index('"', start)
            time = line[start:end]
            dec_time = convert_time_to_decimal(time)
        else:
            if line.strip().startswith('<Message>'):
                start = line.index('>') + 1
                end = line.rindex('<')
                message = line[start:end]
                messages.append(message)
                split_message = split_between_characters(message, '&lt;', ' &gt;')

                if 'Load program' in message or 'Load workflow' in message:
                    exam = split_message[0].strip()
                    relative_path_pre = exam.split('/')[1:]
                    separator = ' - '  # You can use any separator you like
                    relative_path = separator.join(relative_path_pre)
                    patients[f"patient_{patient_idx}"].add_sequence(relative_path)
                elif 'Add ' in message or 'Delete' in message:
                    patients[f"patient_{patient_idx}"].add_notes(message)
                elif 'Start preparation' in message:
                    if len(utilization_times):
                        if check_mode(utilization_times[-1]):
                            utilization_times.pop()
                    utilization_times.append(0)
                    utilization_times.append(dec_time)
                    if len(messages) > 1 and 'Start preparation' in messages[-2]:
                        patients[f"patient_{patient_idx}"].add_notes("Sequence repeat")
                elif 'Stop preparation' in message:
                    if len(utilization_times):
                        if check_mode(utilization_times[-1]):
                            utilization_times.pop()
                    utilization_times.append(dec_time)
                    utilization_times.append(2)
                    if len(messages) > 1 and 'Stop preparation' in messages[-2]:
                        patients[f"patient_{patient_idx}"].add_notes("Sequence repeat")
                elif 'Start measurement' in message:
                    if len(utilization_times):
                        if check_mode(utilization_times[-1]):
                            utilization_times.pop()
                    utilization_times.append(1)
                    utilization_times.append(dec_time)
                    if 'Start measurement' in messages[-2]:
                        patients[f"patient_{patient_idx}"].add_notes("Sequence repeat")
                else:
                    if len(utilization_times):
                        if check_mode(utilization_times[-1]):
                            utilization_times.pop()
                    utilization_times.append(dec_time)
                    utilization_times.append(2)
                    if 'Stop measurement' in messages[-2]:
                        patients[f"patient_{patient_idx}"].add_notes("Sequence repeat")


    if len(utilization_times) != 0 and utilization_times[-1] == 2:
        utilization_times.pop()
    patients[f"patient_{patient_idx}"].start = f"{float_to_time(utilization_times[1])}"
    patients[f"patient_{patient_idx}"].total = f"{round_to_3sf(60* (utilization_times[-1] - utilization_times[1]))}"
    utilization_times.append(3)

    return utilization_times, messages


def get_subfolders(folder):
    subfolders = [f.path for f in os.scandir(folder) if f.is_dir()]
    return subfolders