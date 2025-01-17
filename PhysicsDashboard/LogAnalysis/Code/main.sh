#!/bin/bash

directory_path="/Users/radiologyadmin/Documents/MRI_Scanner_Shared/"
permissions="755"  # Example permissions

# Main loop
while true; do
    # Get current hour and minute
    current_hour=$(date +"%H")
    current_minute=$(date +"%M")

    # Check if it's 11:50 PM
    if [ "$current_hour" -eq 23 ] && [ "$current_minute" -eq 52 ]; then
        # Run the main part of the script
        # Define the directory path and permissions

        /Users/radiologyadmin/Documents/PhysicsDashboard/LogAnalysis/Code/permissions.sh       
        python3 "/Users/radiologyadmin/Documents/PhysicsDashboard/LogAnalysis/Code/main.py"
        sleep 120
        # /Users/radiologyadmin/Documents/PhysicsDashboard/JsonFormatter/Code/main

    fi

    # Sleep for 1 minute before checking again
    sleep 60
done
