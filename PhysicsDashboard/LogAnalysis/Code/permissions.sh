#!/bin/bash

# Define the directory path and permissions
directory_path="/Users/radiologyadmin/Documents/"
permissions="755"  # Example permissions

# Run chmod with sudo using expect
expect << EOF
spawn sudo chmod -R "$permissions" "$directory_path"
expect "Password:"
send "qwer1234\r"
expect eof
EOF

