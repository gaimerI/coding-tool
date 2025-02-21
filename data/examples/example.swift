import Foundation

func factorial(_ n: Int) -> Int {
    // factorial of 0 or 1 is 1
    if n == 0 || n == 1 {
        return 1
    } else {
        // recursion
        return n * factorial(n - 1)
    }
}

// ========
let number = 5 // this can be changed
// ========
let result = factorial(number)
print("The factorial of \(number) is \(result).")
