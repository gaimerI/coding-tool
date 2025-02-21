function factorialRecursive(n: number): number {
    if (n < 0) {
        throw new Error("Factorial is not defined for negative numbers.");
    }
    if (n === 0 || n === 1) {
        return 1;
    }
    return n * factorialRecursive(n - 1);
}

// Example usage
const number2 = 5;
console.log(`Factorial of ${number2} (recursive):`, factorialRecursive(number2));
