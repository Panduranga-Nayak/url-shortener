export function generateRandomSalt() {
    return Math.floor(Math.random() * Math.pow(10, 18));
}