#include <stdio.h>

// Function to calculate factorial
unsigned long long factorial(int n) {
    unsigned long long result = 1;
    for (int i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

int main() {
    int number;

    // Ask the user for input
    printf("Enter a positive integer: ");
    scanf("%d", &number);

    // Check if the input is a positive integer
    if (number < 0) {
        printf("Factorial is not defined for negative numbers.\n");
    } else {
        unsigned long long fact = factorial(number);
        printf("Factorial of %d = %llu\n", number, fact);
    }

    return 0;
}
