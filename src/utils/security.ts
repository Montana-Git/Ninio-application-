/**
 * Security utility functions for the application
 */

/**
 * Generate a cryptographically secure random password
 * 
 * @param length - The length of the password (default: 12)
 * @param includeSpecialChars - Whether to include special characters (default: true)
 * @returns A secure random password
 */
export function generateSecurePassword(length: number = 12, includeSpecialChars: boolean = true): string {
  // Define character sets
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  
  // Combine character sets based on options
  let allChars = uppercaseChars + lowercaseChars + numberChars;
  if (includeSpecialChars) {
    allChars += specialChars;
  }
  
  // Ensure minimum length
  if (length < 8) {
    console.warn('Password length less than 8 is not recommended. Using 8 as minimum.');
    length = 8;
  }
  
  // Generate random bytes using Web Crypto API
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  
  // Convert random bytes to password characters
  let password = '';
  for (let i = 0; i < length; i++) {
    // Map the random byte to a character in our character set
    const randomIndex = randomValues[i] % allChars.length;
    password += allChars[randomIndex];
  }
  
  // Ensure password contains at least one character from each required set
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = includeSpecialChars ? /[!@#$%^&*()-_=+[\]{}|;:,.<>?]/.test(password) : true;
  
  // If any required character type is missing, regenerate the password
  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    return generateSecurePassword(length, includeSpecialChars);
  }
  
  return password;
}

/**
 * Validate password strength
 * 
 * @param password - The password to validate
 * @returns An object with validation result and feedback
 */
export function validatePasswordStrength(password: string): { 
  isValid: boolean; 
  score: number; 
  feedback: string;
} {
  if (!password) {
    return { isValid: false, score: 0, feedback: 'Password is required' };
  }
  
  let score = 0;
  const feedback: string[] = [];
  
  // Length check
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  } else {
    score += Math.min(2, Math.floor(password.length / 4));
  }
  
  // Character variety checks
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add uppercase letters');
  }
  
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add lowercase letters');
  }
  
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add numbers');
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add special characters');
  }
  
  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) { // Repeated characters
    score -= 1;
    feedback.push('Avoid repeated characters');
  }
  
  if (/^(?:123456|password|qwerty|abc123)$/i.test(password)) { // Common passwords
    score = 0;
    feedback.push('This is a commonly used password');
  }
  
  // Final score and result
  const isValid = score >= 3 && password.length >= 8;
  const finalFeedback = feedback.length > 0 ? feedback.join('. ') : 'Password is strong';
  
  return {
    isValid,
    score: Math.max(0, Math.min(5, score)),
    feedback: finalFeedback
  };
}
