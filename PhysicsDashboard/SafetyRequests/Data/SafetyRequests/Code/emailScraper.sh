#!/bin/bash

echo "Initialised"


# Define the email address for the account
EMAIL_ADDRESS="mrisafety@gstt.nhs.uk"

# Define the name of the inbox mailbox
INBOX_NAME="Inbox"

# Define the path to the Documents directory
DOCUMENTS_DIR="$HOME/Documents"

EMAILS_DIR="$DOCUMENTS_DIR/MRI_Scanner_Shared/Physics/Development/SafetyRequests/Data"

# Function to get the most recent message and save it to a file with timestamp
get_and_save_message() {
    # Get the current date in the format DD_MM_YYYY
    current_date=$(date +"%d_%m_%Y")

    # Check if the directory for the current date exists in EMAILS_DIR
    if [ ! -d "$EMAILS_DIR/$current_date" ]; then
        # If the directory doesn't exist, create it
        mkdir -p "$EMAILS_DIR/$current_date"
        echo "Created directory: $EMAILS_DIR/$current_date"
    fi

    # Use AppleScript to get the most recent message in the inbox mailbox for the specified email account
    message_info=$(osascript -e "tell application \"Mail\" to get subject of first message of mailbox \"${INBOX_NAME}\" of account \"${EMAIL_ADDRESS}\" & return & content of first message of mailbox \"${INBOX_NAME}\" of account \"${EMAIL_ADDRESS}\"")

    # Generate timestamp for the filename
    timestamp=$(date +"%H%M%S")

    # Save the most recent message information to a text file with timestamp in the subdirectory of current date
    if [ -n "$message_info" ]; then
        echo "$message_info" > "$EMAILS_DIR/$current_date/message_$timestamp.txt"
        echo "Most recent message information saved to $EMAILS_DIR/$current_date/message_$timestamp.txt"
    else
        echo "Unable to retrieve the most recent message in the inbox for account \"$EMAIL_ADDRESS\"."
    fi
}

# Initial run to get and save the most recent message
get_and_save_message

# Open the Mail app minimized
osascript -e 'tell application "Mail" to activate' -e 'tell application "System Events" to keystroke "m" using command down'

# Continuously check for the most recent message
while true; do
    # Get the current hour
    current_hour=$(date +"%H")

    # Check if the current hour is between 5 AM and 9 PM (inclusive)
    if [ "$current_hour" -ge 5 ] && [ "$current_hour" -lt 21 ]; then
        # If within the specified hours, wait for 5 seconds
        sleep 120
    else
        # If outside the specified hours, wait for 1 hour
        sleep 3600
    fi

    # Get the current most recent message
    current_message=$(osascript -e "tell application \"Mail\" to get subject of first message of mailbox \"${INBOX_NAME}\" of account \"${EMAIL_ADDRESS}\" & return & content of first message of mailbox \"${INBOX_NAME}\" of account \"${EMAIL_ADDRESS}\"")

    # Compare with the previously saved message
    saved_message=$(cat "$EMAILS_DIR/message_$timestamp.txt")

    if [ "$current_message" != "$saved_message" ]; then
        # Save the new most recent message if it's different
        get_and_save_message
    else
        # Print "No new message" if the current message is the same as the saved one
        echo "No new message"
    fi
done
