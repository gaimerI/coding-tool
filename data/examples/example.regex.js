// Example string
const text = "The quick brown fox jumps over the lazy dog. The quick brown fox is quick.";

// Regular expression to find the word "quick"
const regex = /quick/g;

// Finding all occurrences of the word "quick"
const matches = text.match(regex);
console.log("Matches for 'quick':", matches); // Output: Matches for 'quick': [ 'quick', 'quick', 'quick' ]

// Replacing the word "quick" with "slow"
const replacedText = text.replace(regex, "slow");
console.log("Replaced text:", replacedText);
// Output: Replaced text: The slow brown fox jumps over the lazy dog. The slow brown fox is slow.

// Regular expression to find all words that start with a vowel
const vowelRegex = /\b[aeiouAEIOU]\w*/g;
const vowelWords = text.match(vowelRegex);
console.log("Words that start with a vowel:", vowelWords);
// Output: Words that start with a vowel: [ 'over' ]

// Regular expression to check if the string contains a number
const numberRegex = /\d/;
const containsNumber = numberRegex.test(text);
console.log("Contains a number:", containsNumber); // Output: Contains a number: false

// Example string with a number
const textWithNumber = "There are 3 cats and 4 dogs.";
const containsNumberInText = numberRegex.test(textWithNumber);
console.log("Contains a number in new text:", containsNumberInText); // Output: Contains a number in new text: true
