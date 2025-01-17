#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunused-parameter"
#pragma clang diagnostic ignored "-Wmissing-prototypes"


#include <iostream>
#include <sstream>
#include <iomanip>
#include <vector>
#include <string>
#include <fstream>
#include <algorithm>
#include "/Users/radiologyadmin/Documents/PhysicsDashboard/JsonFormatter/Packages/jsoncpp-0.y.z/include/json/json.h"
#include <filesystem>

#pragma clang diagnostic pop


double time_to_decimal(const std::string& time_str) {
    std::istringstream iss(time_str);
    int hours, minutes, seconds;
    char colon;
    if (!(iss >> hours >> colon >> minutes >> colon >> seconds)) {
        // error
        return -1.0;
    }
    return hours + (minutes / 60.0) + (seconds / 3600.0);
}

std::string decimal_to_time(double decimal_time) {
    int hours = static_cast<int>(decimal_time);
    int minutes = static_cast<int>((decimal_time - hours) * 60);
    std::stringstream ss;
    ss << std::setfill('0') << std::setw(2) << hours << ":" << std::setw(2) << minutes;
    return ss.str();
}

std::pair<std::vector<double>, std::vector<std::string>> format_x_ticks(double min_time, double max_time, double interval) {
    std::vector<double> x_ticks;
    std::vector<std::string> x_labels;
    x_ticks.push_back(min_time);
    x_labels.push_back(decimal_to_time(min_time));

    while (x_ticks.back() < max_time) {
        x_ticks.push_back(x_ticks.back() + interval);
        x_labels.push_back(decimal_to_time(x_ticks.back()));
    }
    return std::make_pair(x_ticks, x_labels);
}
//notes to self:
//have end time of previous scan as input, default to none?
//dead time as sum over the day - instead of "dead time" have end time then write a different function to sum dead times over the day
//loop through directories
//save jsons (one for each scan) labelled scan 1, scan 2 etc into a folder named as the date
//start time + measurement time + pause

void convert_json(const std::string& inputFileName) {
    // this function converts the jsons into the format "labels" ..... "data" .... format
    //it previosuly worked and was saving the files into the current directory named as the date in format yyyymmdd
    //it's currently in the process of being modified so the files save as 1, 2, 3 etc in a folder named as yyyymmdd
    std::ifstream inputFile(inputFileName);

    Json::Value root;
    Json::CharReaderBuilder builder;
    std::string errors;
    bool parsingSuccessful = Json::parseFromStream(builder, inputFile, &root, &errors);
    inputFile.close();

    if (!parsingSuccessful) {
        std::cerr << "Error: Failed to parse JSON: " << errors << std::endl;
        return;
    }

    //get date for filename when saving
    Json::Value data;
    std::string dateAndTime = root["date_and_time"].asString();
    //std::replace(dateAndTime.begin(), dateAndTime.end(), ':', '_');
    std::string output_file_name;
    std::string year = dateAndTime.substr(0, 4); // Extract first four digits for the year
    std::string month = dateAndTime.substr(5, 2);
    std::string day = dateAndTime.substr(8, 2);
    output_file_name = year + month + day;


    if (inputFileName.find("adj") != std::string::npos) {
        Json::Value labels;
        labels.append("Start Time of Measurement");
        labels.append("Shimming Time");
        labels.append("End Time");
        labels.append("Breaks");

        Json::Value data;
        std::string start_time = root["start_time"].asString();
        std::string measurementTime = root["measurement_time"].asString();
        std::string breaks = root["allowed_meas_pause"].asString();
        double decimal_start_time = time_to_decimal(start_time);
        std::string measurement_time_s = root["measurement_time"].asString();
        std::string measurement_time = measurement_time_s.substr(0, 8);
        std::string pause_after_measurement_s = root["pause_after_measurement"].asString();
        std::string pause_after_measurement = pause_after_measurement_s.substr(0, 8);
        double pause_after_measurement_double = std::stod(pause_after_measurement);
        double measurement_time_double = std::stod(measurement_time);
        double end_time = decimal_start_time + measurement_time_double + pause_after_measurement_double;


        data.append(decimal_start_time);
        data.append(measurementTime);
        data.append(end_time);
        data.append(breaks);

        Json::Value outputJson;
        outputJson["labels"] = labels;
        outputJson["data"] = data;

        namespace fs = std::filesystem;
        // Check if the folder exists
        if (!fs::exists(output_file_name)) {
            // If the folder doesn't exist, create it
            fs::create_directory(output_file_name);
            std::cout << "Folder created: " << output_file_name << std::endl;
        }

        // Change the current directory to the newly created folder
        if (fs::is_directory(output_file_name)) {
            fs::current_path(output_file_name);
            std::cout << "Current directory changed to: " << fs::current_path() << std::endl;
        }

        std::ofstream outputFile(output_file_name);
        if (!outputFile.is_open()) {
            std::cerr << "Error: Unable to open output file: " << output_file_name << std::endl;
            return;
        }

        outputFile << outputJson;
        outputFile.close();

        std::cout << "Conversion successful. Output written to: " << output_file_name << std::endl;
    } else {
        Json::Value labels;
        labels.append("Start Time of Measurement");
        labels.append("Scanning Time");
        labels.append("End Time");
        labels.append("Breaks");

        Json::Value data;
        std::string start_time = root["start_time"].asString();
        std::string measurementTime = root["measurement_time"].asString();
        std::string breaks = root["allowed_meas_pause"].asString();
        double decimal_start_time = time_to_decimal(start_time);
        std::string measurement_time_s = root["measurement_time"].asString();
        std::string measurement_time = measurement_time_s.substr(0, 8);
        std::string pause_after_measurement_s = root["pause_after_measurement"].asString();
        std::string pause_after_measurement = pause_after_measurement_s.substr(0, 8);
        double pause_after_measurement_double = std::stod(pause_after_measurement);
        double measurement_time_double = std::stod(measurement_time);
        double end_time = decimal_start_time + measurement_time_double + pause_after_measurement_double;

        data.append(decimal_start_time);
        data.append(measurementTime);
        data.append(end_time);
        data.append(breaks);

        Json::Value outputJson;
        outputJson["labels"] = labels;
        outputJson["data"] = data;

        namespace fs = std::filesystem;
        // Check if the folder exists
        if (!fs::exists(output_file_name)) {
            // If the folder doesn't exist, create it
            fs::create_directory(output_file_name);
            std::cout << "Folder created: " << output_file_name << std::endl;
        }

        // Change the current directory to the newly created folder
        if (fs::is_directory(output_file_name)) {
            fs::current_path(output_file_name);
            std::cout << "Current directory changed to: " << fs::current_path() << std::endl;
        }

        std::ofstream outputFile(output_file_name);
        if (!outputFile.is_open()) {
            std::cerr << "Error: Unable to open output file: " << output_file_name << std::endl;
            return;
        }

        outputFile << outputJson;
        outputFile.close();

        std::cout << "Conversion successful. Output written to: " << output_file_name << std::endl;
    }
}

double calculate_dead_time(const std::string& folder_path, int num_files) {
    // work in progress function to sum over whole day's start / end times and get total dead time
    double dead_time = 0.0;

    for (int i = 1; i <= num_files; ++i) {
        std::string file_path = folder_path + "/" + std::to_string(i) + ".json";

        std::ifstream file(file_path);
        if (!file.is_open()) {
            std::cerr << "Error opening file: " << file_path << std::endl;
            continue;
        }

        Json::Value json_data;
        Json::CharReaderBuilder builder;
        std::string parse_error;
        try {
            bool parsing_successful = Json::parseFromStream(builder, file, &json_data, &parse_error);
            if (!parsing_successful) {
                std::cerr << "Parse error in file " << file_path << ": " << parse_error << std::endl;
                continue;
            }
        } catch (std::exception &e) {
            std::cerr << "Exception thrown while parsing JSON in file " << file_path << ": " << e.what() << std::endl;
            continue;
        }

        if (!json_data.isObject() || json_data["data"].isNull() || json_data["labels"].isNull()) {
            std::cerr << "Invalid JSON format in file: " << file_path << std::endl;
            continue;
        }

        const Json::Value &data = json_data["data"];
        if (!data.isArray() || data.size() < 4) {
            std::cerr << "Insufficient data in file: " << file_path << std::endl;
            continue;
        }

        double start_time = data[0].asDouble();
        double end_time = data[2].asDouble();
        dead_time += end_time - start_time;
    }

    return dead_time;
}


int main(){
    std::string inputFileName = "/Users/radiologyadmin/Documents/PhysicsDashboard/LogAnalysis/ScannerData/SMRVID/12-03-24/DictFolder/sequence/ScanNo13/ax_dwi_fs_resolve_11.json";
    //std::string outputFileName = "output.json";
    convert_json(inputFileName);
    return 0;
    }