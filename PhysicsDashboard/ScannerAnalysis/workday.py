patient_data = [['07:48', '22.617'], ['08:58', '22.617'], ['09:46', '8.133'], ['10:18', '55.733'], ['11:20', '36.133'], ['12:04', '31.967'], ['12:10', '16.517'], ['12:45', '46.017'], ['13:40', '21.450'], ['14:07', '13.183'], ['14:42', '26.517'], ['15:23', '20.667'], ['15:48', '18.183'], ['16:09', '15.033'], ['16:10', '5.417'], ['16:30', '16.983'], ['16:54', '14.183'], ['17:14', '7.433'], ['17:30', '19.217'], ['18:03', '23.133'], ['18:30', '28.767'], ['19:48', '22.617']]


def workday(patient_data):

    top = 0

    bottom = 0

    idx_remove = []

    def remove_indices(lst, indices):

        for index in sorted(indices, reverse=True):

            if 0 <= index < len(lst):

                del lst[index]

        return lst

    def get_mins(time):

        return 60*int(time[:2]) + int(time[3:])

    start_times = [x[0] for x in patient_data]

    total_times = [x[1] for x in patient_data]

    total_time = 0

    if top < 1:

        for i in range(len(start_times)):

            start_mins = get_mins(start_times[i])

            end_mins = start_mins + float(total_times[i])

            diff = start_mins - 480

            if diff < 0 and end_mins <= 480:

                total_time += 0

                idx_remove.append(i)

            if diff < 0 and end_mins > 480:

                total_time += end_mins - 480

                idx_remove.append(i)

                top += 1

            else:

                top += 1

    if bottom < 1:

        for i in range(len(start_times)-1, -1, -1):

            start_mins = get_mins(start_times[i])

            end_mins = start_mins + float(total_times[i])

            diff = 1200 - start_mins

            if diff < 0:

                total_time += 0

                idx_remove.append(i)

            if diff > 0 and end_mins > 1200:

                total_time += end_mins - 1200

                idx_remove.append(i)

                bottom += 1

            else:

                bottom += 1

    cleaned_data = remove_indices(patient_data, idx_remove)

    for i in cleaned_data:

        total_time += float(i[1])

    return float(100*total_time/720)




