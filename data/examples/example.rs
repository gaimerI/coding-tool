fn factorial(n: u64) -> u64 {
    if n == 0 {
        1
    } else {
        n * factorial(n - 1)
    }
}

fn main() {
  // =========
    let number: u64 = 5; // change this number to calculate a different factorial
  // =========
    let result = factorial(number);
    println!("The factorial of {} is {}", number, result);
}
