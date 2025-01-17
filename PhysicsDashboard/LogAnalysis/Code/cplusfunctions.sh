#!/bin/bash

# Check if the correct number of arguments is provided
if [ "$#" -lt 4 ]; then
    echo "Usage: $0 <arg1> <arg2> <arg3> <arg4>"
    exit 1
fi

arg1="$1"         # Get arg1
arg2="$2"         # Get arg2
arg3="$3"
arg4="$4"   
args=("$@")       # Get the remaining arguments


echo "Number of arguments: $#"
echo "$arg1"
echo "$arg2"
echo "$arg3"
echo "$arg4"


# Store the current directory
current_directory=$(pwd)

# Change directory to the desired location including arg3
cd "/Users/radiologyadmin/CLionProjects/$arg4/cmake-build-debug"

# Run the specified script with the provided arguments
"./${arg4}" "$arg1" "$arg2" "$arg3"

# Change back to the original directory
cd "$current_directory"
