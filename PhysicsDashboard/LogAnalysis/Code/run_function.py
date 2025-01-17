from csa_maps import sed_csa_map, sar_csa_map, sequence_csa_map, abstract_csa_map, b1_csa_map
from misc_functions import remove_dir, save_obj_json, get_log_bases
from rfLogAnalysisFunctions import separate_and_save_log
from rfLogClassManipulationFunctions import get_sequence_data
from datetime import datetime
import os


def rf_log_analysis(current_date, scanner, data_type, parameter_list, log_file_path, body_type, dataset_no):

    "File Paths and parameters to analyse"
    data_path = get_log_bases(log_file_path)
    file_base_folder = f"/Users/radiologyadmin/Documents/PhysicsDashboard/LogAnalysis/ScannerData/{scanner}/{current_date}"
    save_folder = f"{file_base_folder}/SaveFolder/ScanNo{dataset_no}/"
    dict_folder = f"{file_base_folder}/DictFolder/{data_type}/ScanNo{dataset_no}/"
    # csv_folder = f"{file_base_folder}/CSVFolder/{data_type}/ScanNo{dataset_no}/"
    # figure_folder = f"{file_base_folder}/Figure_Folder/{data_type}/ScanNo{dataset_no}/"
    if not os.path.exists(file_base_folder):
        os.makedirs(file_base_folder)
    if not os.path.exists(save_folder):
        os.makedirs(save_folder)
    if not os.path.exists(dict_folder):
        os.makedirs(dict_folder)
    # if not os.path.exists(csv_folder):
    #     os.makedirs(csv_folder)
    # if not os.path.exists(figure_folder):
    #     os.makedirs(figure_folder)
    creation_time = str(datetime.fromtimestamp(os.path.getctime(log_file_path))).split(' ', 1)[0]

    """Field strength mapping"""
    field_strength = None
    field_map = {'GMRI2': 1.5,
                 'SMRVID': 3}
    for key in field_map:
        if key in data_path:
            field_strength = field_map[key]


    "Split Up the log file into constituent sequences and get csa map from defined data type"
    separate_and_save_log(log_file_path, save_folder)
    data_map = None
    dt_map = {'sequence': sequence_csa_map,
              'b1': b1_csa_map,
              'sed': sed_csa_map,
              'sar': sar_csa_map,
              'abstract': abstract_csa_map}
    for key, value in dt_map.items():
        if data_type in key:
            data_map = value

    "Sort the files according to where they come in the log file"
    files = [file for file in os.listdir(save_folder) if file.endswith('.txt')]
    sorted_list = sorted(files, key=lambda x: int((x.split('_')[1]).split('.')[0]))

    "Get instances of the protocol class"
    locals()[f"{data_type}_protocol_{creation_time}"] = []
    exam_times = 0
    sequence_names = []

    for idx, i in enumerate(sorted_list):

        selected_sequence, data_list, total_time = get_sequence_data(f"{save_folder}{i}", data_map)
        if total_time is not None:
            exam_times = exam_times + total_time
            sequence_names.append(selected_sequence)
        save_obj_json(dict_folder, selected_sequence, idx)
        locals()[f"{data_list[-1]}"] = selected_sequence
        locals()[f"{data_type}_protocol_{creation_time}"].append(locals()[f"{data_list[-1]}"])

    return exam_times






