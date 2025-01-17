#!/bin/bash

# Define the directory path and permissions
directory_path="/Users/radiologyadmin/Documents/MRI_Scanner_Shared/"
permissions="755"  # Example permissions for the directory and files

# Main loop
while true; do
    # Get current hour and minute
    current_hour=$(date +"%H")
    current_minute=$(date +"%M")

    # Check if it's 11:50 PM
    if [ "$current_hour" -eq 23 ] && [ "$current_minute" -eq 52 ]; then
        # Unlock permissions for the directory and all files under it
        echo "Changing permissions for $directory_path and its contents..."

        # Run chmod with sudo using expect to change permissions recursively
        expect << EOF
spawn sudo chmod -R "$permissions" "$directory_path"
expect "Password:"
send "qwer1234\r"
expect eof
EOF

        # Run the main Python script
        echo "Running Python script..."
        python3 "/Users/radiologyadmin/Documents/PhysicsDashboard/ScannerAnalysis/main.py"
        python3 "/Users/radiologyadmin/Documents/PhysicsDashboard/ScannerAnalysis/inactivity_notification.py"

        # Sleep for 2 minutes (120 seconds)
        sleep 120
    fi

    # Sleep for 1 minute before checking again
    sleep 60
done
