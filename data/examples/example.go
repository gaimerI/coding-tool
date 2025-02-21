package main

import (
	"fmt"
)

// factorial function calculates the factorial of n recursively
func factorial(n int) int {
	if n == 0 {
		return 1 // Base case: 0! is 1
	}
	return n * factorial(n-1) // Recursive case
}

func main() {
	var number int

	fmt.Print("Enter a number to calculate its factorial: ")
	fmt.Scan(&number)

	if number < 0 {
		fmt.Println("Factorial is not defined for negative numbers.")
	} else {
		result := factorial(number)
		fmt.Printf("The factorial of %d is %d\n", number, result)
	}
}
