-- Function to calculate factorial
function factorial(n)
    if n < 0 then
        return nil -- Factorial is not defined for negative numbers
    elseif n == 0 then
        return 1 -- Base case: 0! is 1
    else
        return n * factorial(n - 1) -- Recursive case
    end
end

-- Example usage
local number = 5
local result = factorial(number)

if result then
    print("The factorial of " .. number .. " is " .. result)
else
    print("Factorial is not defined for negative numbers.")
end
