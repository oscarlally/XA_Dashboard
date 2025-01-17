
def extract_exam(file_path):
    study_description_lines = []
    with open(file_path, 'r') as file:
        found_trigger = False
        for line in file:
            if found_trigger:
                study_description_lines.append(line.strip())
                if len(study_description_lines) == 2:
                    break
            elif '<ParamString."tStudyDescription">' in line:
                found_trigger = True
    return study_description_lines[1]
