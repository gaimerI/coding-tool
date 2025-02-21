#include <iostream>

// all examples calculate the factorial
unsigned long long factorial(int n) {
    if (n == 0) {
        return 1; // 0! is apparently 1
    } else {
        return n * factorial(n - 1); // careful recursion
    }
}

int main() {
    int number;

    std::cout << "Enter a positive integer: ";
    std::cin >> number;

    if (number < 0) {
        std::cout << "Factorial is not defined for negative numbers." << std::endl;
    } else {
        unsigned long long result = factorial(number);
        std::cout << "Factorial of " << number << " is " << result << std::endl;
    }

    return 0;
}
