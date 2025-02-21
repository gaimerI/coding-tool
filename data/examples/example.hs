-- Function to calculate factorial
factorial :: Integer -> Integer
factorial 0 = 1  -- Base case: factorial of 0 is 1
factorial n = n * factorial (n - 1)  -- Recursive case

-- Main function to test the factorial function
main :: IO ()
main = do
    putStrLn "Enter a number to calculate its factorial:"
    input <- getLine
    let number = read input :: Integer
    let result = factorial number
    putStrLn $ "The factorial of " ++ show number ++ " is " ++ show result
