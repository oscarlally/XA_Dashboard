from patient_details import get_specific_files

def get_weather(folder_path):

    weather = []

    temp_log_file_pre = get_specific_files(folder_path, 'PerAirTemperature')

    if len(temp_log_file_pre) != 0:

        temp_log_file = temp_log_file_pre[0]

    else:

        return 0, 0, 0

    print('HEllo', temp_log_file)

    with open(temp_log_file, 'rb') as file:
        file.seek(-2, 2)

        # Iterate backward until the start of the last line is found
        while file.read(1) != b'\n':
            file.seek(-2, 1)

        # Read the last line
        last_line = file.readline().decode()

        print(last_line)

        parameters = last_line.split(';')

        weather.append(float(parameters[0].split(':')[-1].split(' ')[-3]))

        for i in parameters[1:-1]:

            weather.append(float(i.split(' ')[-3]))

        return round((weather[0] + weather[1] + weather[3])/3, 1), weather[2], weather[4]
