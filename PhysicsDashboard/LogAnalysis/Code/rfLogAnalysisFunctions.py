import re


def adjust_line(input_string):
    # Use a regular expression to match spaces not adjacent to a colon
    pattern = r'(?<!:)\s(?!:)'
    pattern_2 = r'([a-zA-Z0-9])(\.{3,})'

    if ' 8' in input_string and 'aspect name' in input_string:
        input_string = input_string.replace('aspect name', 'aspect_prim_name')
    if ' 9' in input_string and 'aspect name' in input_string :
        input_string = input_string.replace('aspect name', 'aspect_sec_name')

    # Replace matching spaces with underscores
    first_string = re.sub(pattern, '_', input_string)
    result_string = re.sub(pattern_2, r'\1_\2', first_string)
    result_string = result_string.replace('__', ' ')
    result_string = result_string.replace(')', '')
    result_string = result_string.replace('(', '')
    result_string = result_string.replace('_/_', '_')
    result_string = result_string.replace('&', 'and')
    result_string = result_string[:-1] + '\n'

    return result_string


def alter_bracket_inputs(input_string):
    if "[" in input_string:
        a = input_string.replace('[', '').replace(']', '')
        return a[:-3] + a[-3:-2] + '_' + a[-2:]
    else:
        return input_string



def separate_and_save_log(file_path, save_folder):
    try:
        with open(file_path, 'r') as log_file:
            lines = log_file.readlines()

            # Find the positions of '=' character occurrences
            equals_positions = [i for i, line in enumerate(lines) if '=' in line]

            # Add 0 and len(lines) to include the start and end positions
            section_positions = [0] + equals_positions + [len(lines)]

            for i in range(2, len(section_positions)):
                start = section_positions[i - 1]
                end = section_positions[i]
                section_lines = lines[start:end]

                # Remove empty lines and lines starting with a dash
                section_lines = [adjust_line(alter_bracket_inputs(line.lower())) for line in section_lines if line.strip() and not line.strip().startswith('-')]

                # Create a new .txt file and save the section content
                with open(f"{save_folder}section_{i-1}.txt", 'w') as section_file:
                    section_file.writelines(section_lines)

    except FileNotFoundError:
        print(f"File not found: {file_path}")
    except IOError:
        print(f"Error reading the file: {file_path}")

    
def process_data(time_table, prep_index, df, adj_time, total_pause):
    total_elapsed = time_table[len(time_table) - 1][4]
    total_prep = time_table[prep_index][4]
    without_cumulative = df.iloc[:, :4]
    print(without_cumulative)
    print(f"Total Elapsed time:  {total_elapsed}")
    print(f"Total Preparation time:  {total_prep}")
    print(f"Total Adjustment time:  {adj_time}")
    print(f"Total Pause After Measure time:  {total_pause}")
        











