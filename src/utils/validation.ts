/**
 * Validation utility functions for the application
 */

/**
 * Validate an email address
 * 
 * @param email - The email address to validate
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  // Basic email regex pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

/**
 * Validate a phone number
 * 
 * @param phone - The phone number to validate
 * @returns Whether the phone number is valid
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  
  // Remove any non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if the number has a reasonable length (7-15 digits)
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
}

/**
 * Validate a date string
 * 
 * @param dateStr - The date string to validate (YYYY-MM-DD format)
 * @returns Whether the date is valid
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  
  // Check format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  
  // Parse the date
  const date = new Date(dateStr);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) return false;
  
  // Check if the parsed date matches the input (to catch invalid dates like 2023-02-31)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}` === dateStr;
}

/**
 * Validate a credit card number using Luhn algorithm
 * 
 * @param cardNumber - The credit card number to validate
 * @returns Whether the credit card number is valid
 */
export function isValidCreditCard(cardNumber: string): boolean {
  if (!cardNumber) return false;
  
  // Remove any non-digit characters
  const digitsOnly = cardNumber.replace(/\D/g, '');
  
  // Check if the number has a valid length
  if (digitsOnly.length < 13 || digitsOnly.length > 19) return false;
  
  // Luhn algorithm (checksum)
  let sum = 0;
  let shouldDouble = false;
  
  // Loop through digits from right to left
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let digit = parseInt(digitsOnly.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

/**
 * Validate a credit card expiry date
 * 
 * @param expiryDate - The expiry date to validate (MM/YY format)
 * @returns Whether the expiry date is valid
 */
export function isValidExpiryDate(expiryDate: string): boolean {
  if (!expiryDate) return false;
  
  // Check format (MM/YY)
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) return false;
  
  const [monthStr, yearStr] = expiryDate.split('/');
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10) + 2000; // Convert YY to 20YY
  
  // Check if month is valid
  if (month < 1 || month > 12) return false;
  
  // Get current date
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
  const currentYear = now.getFullYear();
  
  // Check if the card is not expired
  return (year > currentYear) || (year === currentYear && month >= currentMonth);
}

/**
 * Validate a CVV code
 * 
 * @param cvv - The CVV code to validate
 * @returns Whether the CVV code is valid
 */
export function isValidCVV(cvv: string): boolean {
  if (!cvv) return false;
  
  // CVV should be 3-4 digits
  const digitsOnly = cvv.replace(/\D/g, '');
  return /^\d{3,4}$/.test(digitsOnly);
}

/**
 * Sanitize a string to prevent XSS attacks
 * 
 * @param input - The string to sanitize
 * @returns The sanitized string
 */
export function sanitizeString(input: string): string {
  if (!input) return '';
  
  // Replace potentially dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate a name (first name, last name)
 * 
 * @param name - The name to validate
 * @returns Whether the name is valid
 */
export function isValidName(name: string): boolean {
  if (!name) return false;
  
  // Name should be at least 2 characters and contain only letters, spaces, hyphens, and apostrophes
  return /^[A-Za-z\s'-]{2,}$/.test(name);
}

/**
 * Validate a password against security requirements
 * 
 * @param password - The password to validate
 * @returns Whether the password meets security requirements
 */
export function isValidPassword(password: string): boolean {
  if (!password) return false;
  
  // Password should be at least 8 characters and contain at least one uppercase letter,
  // one lowercase letter, one number, and one special character
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}
