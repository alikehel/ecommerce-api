// Helper function to validate expiry date is not in the past
// TODO: Should this work if the date is the current month?
export function validateExpiryDate(date: string): boolean {
    const [month, year] = date.split("/").map(Number);
    const expiry = new Date(+`20${year}`, month - 1);
    const now = new Date();
    return expiry >= now;
}
