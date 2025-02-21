<?php
function factorial($n) {
    // Check if the number is negative
    if ($n < 0) {
        return "Factorial is not defined for negative numbers.";
    }
    // Base case: factorial of 0 is 1
    if ($n === 0) {
        return 1;
    }
    // Recursive case
    return $n * factorial($n - 1);
}

// Example usage
$number = 5; // Change this number to test with other values
$result = factorial($number);
echo "The factorial of $number is $result.";
?>
