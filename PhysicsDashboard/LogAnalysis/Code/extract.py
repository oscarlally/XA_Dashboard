from datetime import datetime
import decimal
import pytz
import math
import json
import re


class Patient:
    def __init__(self, index):
        self.index = index
        self. name = None
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


def get_bookend(message):
    if 'Start' in message:
        return 1
    elif 'Stop' in message:
        return 2


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


def split_file_into_days(file_path):
    sections = []
    current_section = []

    with open(file_path, 'r') as file:
        for line in file:
            if '<Event type="UtilizationEvent" name ="SmartConnect"' in line:
                if current_section:
                    sections.append(current_section)
                current_section = [line.strip()]
            else:
                current_section.append(line.strip())

    # Append the last section
    if current_section:
        sections.append(current_section)

    return sections


def split_list_into_sections(lines):
    sections = []
    current_section = []
    loading_started = False

    for i, line in enumerate(lines):
        if '<Event type="UtilizationEvent" name ="Utilization"' in line:
            next_line = lines[i + 1] if i + 1 < len(lines) else None
            if next_line and ('Load program' in next_line or 'Load workflow' in next_line):
                if current_section:
                    sections.append(current_section)
                current_section = [line.strip(), next_line.strip()]
                loading_started = True
            elif loading_started:
                current_section.append(line.strip())
                if next_line:
                    current_section.append(next_line.strip())
        else:
            if current_section:
                current_section.append(line.strip())

    if current_section:
        sections.append(current_section)

    return sections



def parse_utilization_events(patients, section, patient_idx):
    utilization_events = []
    utilization_times = []
    utilization_messages = []

    patients[f"patient_{patient_idx}"] = Patient(patient_idx)
    message_comp = None

    for i in range(len(section)):
        line = section[i].strip()
        if line.startswith('<Event type="UtilizationEvent" name ="Utilization"'):
            event = [line]
            time = None
            message = None

            # Extract the time from the event line
            start = line.index('time="') + len('time="')
            end = line.index('"', start)
            time = line[start:end]

            # Collect the rest of the event lines
            j = i + 1
            while not section[j].strip().startswith('</Event>'):
                event.append(section[j].strip())
                if section[j].strip().startswith('<Message>'):
                    start = section[j].index('>') + 1
                    end = section[j].rindex('<')
                    message = section[j][start:end]
                j += 1
            event.append(section[j].strip())

            utilization_events.append('\n'.join(event))
            utilization_messages.append(message)

            # Parse the message
            split_message = split_between_characters(message, '&lt;', ' &gt;')
            dec_time = convert_time_to_decimal(time)

            if 'Load program' in message or 'Load workflow' in message:
                exam = split_message[0].strip()
                relative_path_pre = exam.split('/')[1:]
                separator = ' - '  # You can use any separator you like
                relative_path = separator.join(relative_path_pre)
                patients[f"patient_{patient_idx}"].add_sequence(relative_path)
            elif 'Add ' in message or 'Delete' in message:
                patients[f"patient_{patient_idx}"].add_notes(message)
            elif get_bookend(message) == message_comp and len(utilization_times) != 0:
                print('Got match at time', time)
                print(message, message_comp)
                utilization_times.pop()
                utilization_times.append(dec_time)
                patients[f"patient_{patient_idx}"].add_notes('Sequence repeat')
            else:
                if 'Start preparation' in message:
                    if len(utilization_times):
                        if check_mode(utilization_times[-1]):
                            utilization_times.pop()
                    utilization_times.append(0)
                    utilization_times.append(dec_time)
                elif 'Stop preparation' in message:
                    if len(utilization_times):
                        if check_mode(utilization_times[-1]):
                            utilization_times.pop()
                    utilization_times.append(dec_time)
                    utilization_times.append(2)
                elif 'Start measurement' in message:
                    if len(utilization_times):
                        if check_mode(utilization_times[-1]):
                            utilization_times.pop()
                    utilization_times.append(1)
                    utilization_times.append(dec_time)
                elif 'Stop measurement' in message:
                    if len(utilization_times):
                        if check_mode(utilization_times[-1]):
                            utilization_times.pop()
                    utilization_times.append(dec_time)
                    utilization_times.append(2)

            check = get_bookend(message)
            if check is not None:
                message_comp = check


    if len(utilization_times) == 0:
        return None, None, None

    else:
        if utilization_times[-1] == 2:
            utilization_times.pop()
        patients[f"patient_{patient_idx}"].start = f"{float_to_time(utilization_times[1])}"
        patients[f"patient_{patient_idx}"].total = f"{round_to_3sf(60* (utilization_times[-1] - utilization_times[1]))}"
        utilization_times.append(3)

        return utilization_events, utilization_times, utilization_messages


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
        if key != "":
            data[key] = [value]

    # Write the updated data back to the JSON file
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)