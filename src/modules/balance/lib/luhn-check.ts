// Luhn Algorithm for credit card validation
export function luhnCheck(ccNumber: string): boolean {
    let sum = 0;
    let shouldDouble = false;
    for (let i = ccNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(ccNumber[i]);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}
