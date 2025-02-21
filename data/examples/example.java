import java.util.Scanner;

public class FactorialCalculator {

    // Iterative method to calculate factorial
    public static long factorialIterative(int n) {
        long result = 1;
        for (int i = 1; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    // Recursive method to calculate factorial
    public static long factorialRecursive(int n) {
        if (n == 0) {
            return 1; // Base case: 0! = 1
        } else {
            return n * factorialRecursive(n - 1); // Recursive case
        }
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter a non-negative integer: ");
        int number = scanner.nextInt();

        if (number < 0) {
            System.out.println("Factorial is not defined for negative numbers.");
        } else {
            long iterativeResult = factorialIterative(number);
            long recursiveResult = factorialRecursive(number);

            System.out.println("Factorial of " + number + " (Iterative): " + iterativeResult);
            System.out.println("Factorial of " + number + " (Recursive): " + recursiveResult);
        }

        scanner.close();
    }
}
