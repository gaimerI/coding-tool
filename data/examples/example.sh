#!/bin/bash

# Function to calculate factorial
factorial() {
    local num=$1
    local result=1

    for (( i=2; i<=num; i++ )); do
        result=$((result * i))
    done

    echo $result
}

# Read input from user
read -p "Enter a number: " number

# Check if the input is a non-negative integer
if ! [[ "$number" =~ ^[0-9]+$ ]]; then
    echo "Please enter a non-negative integer."
    exit 1
fi

# Calculate factorial
fact=$(factorial $number)

# Display the result
echo "The factorial of $number is $fact."
