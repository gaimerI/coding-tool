using System;

class FactorialCalculator
{
    // Iterative method to calculate factorial
    public static long FactorialIterative(int n)
    {
        long result = 1;
        for (int i = 2; i <= n; i++)
        {
            result *= i;
        }
        return result;
    }

    // Recursive method to calculate factorial
    public static long FactorialRecursive(int n)
    {
        if (n <= 1)
            return 1;
        return n * FactorialRecursive(n - 1);
    }

    static void Main(string[] args)
    {
        Console.Write("Enter a number to calculate its factorial: ");
        int number = Convert.ToInt32(Console.ReadLine());

        // Calculate factorial using iterative method
        long iterativeResult = FactorialIterative(number);
        Console.WriteLine($"Factorial of {number} (Iterative): {iterativeResult}");

        // Calculate factorial using recursive method
        long recursiveResult = FactorialRecursive(number);
        Console.WriteLine($"Factorial of {number} (Recursive): {recursiveResult}");
    }
}
