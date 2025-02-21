let rec factorial n =
    if n <= 1 then 1
    else n * factorial (n - 1)

// Example usage
let number = 5
let result = factorial number
printfn "Factorial of %d is %d" number result
