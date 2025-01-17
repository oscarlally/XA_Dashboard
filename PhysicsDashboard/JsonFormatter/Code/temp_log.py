import json
from datetime import date
import re
import simplejson

def temp_log(input_name, output_path):

    temperature=[]
    today_date= date.today().strftime(\%Y/%m/%d\)

    #because there is no log from today's date i have used a test date to test the function. It is working. Feell free to change the variable \ toda_date\ with test_date to test
    
    with open(input_name 'r') as f:
        data = f.readlines()

    
    for line in data:
        if today_date in line:
            temperature= re.findall(\Temperature: ([0-9.]*)\ line)
           

    dictionary = {
        "Patient_Air_Temperature_1": temperature[0] 
        "Patient_Air_Temperature_2": temperature[1] 
        "Patient_Air_Temperature_3": temperature[2]
    }
    
    json_object = json.dumps(dictionary indent=2)
    output_name= input_name.replace('.log' '.json')
    #this is so the json file names are different for each date the function is run!
    output_name=date.today().strftime(\%Y-%m-%d\)+output_name
    with open(output_name \w\) as outfile:
        outfile.write(json_object)

    return ('file created')

temp_log(\PerTemp.log\)
        