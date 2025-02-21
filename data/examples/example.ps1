function Factorial {
    param (
        [int]$n
    )
    
    if ($n -le 1) {
        return 1
    } else {
        return $n * (Factorial ($n - 1))
    }
}

# Example usage
$number = 5
$result = Factorial $number
Write-Output "Factorial of $number is $result"
