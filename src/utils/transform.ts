/**
 * Data transformation utility functions
 */
import { safeGet } from './data';

/**
 * Transform an array of objects to a different structure
 * 
 * @param data - The array of objects to transform
 * @param transformer - The transformation function
 * @returns The transformed array
 */
export function transformArray<T, R>(
  data: T[] | null | undefined,
  transformer: (item: T) => R
): R[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  return data.map(transformer);
}

/**
 * Group an array of objects by a key
 * 
 * @param data - The array of objects to group
 * @param keyGetter - The function to get the key to group by
 * @returns The grouped objects
 */
export function groupBy<T>(
  data: T[] | null | undefined,
  keyGetter: (item: T) => string | number
): Record<string, T[]> {
  if (!data || !Array.isArray(data)) {
    return {};
  }
  
  return data.reduce((acc, item) => {
    const key = String(keyGetter(item));
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Convert an array of objects to a record by a key
 * 
 * @param data - The array of objects to convert
 * @param keyGetter - The function to get the key
 * @returns The record
 */
export function arrayToRecord<T>(
  data: T[] | null | undefined,
  keyGetter: (item: T) => string | number
): Record<string, T> {
  if (!data || !Array.isArray(data)) {
    return {};
  }
  
  return data.reduce((acc, item) => {
    const key = String(keyGetter(item));
    acc[key] = item;
    return acc;
  }, {} as Record<string, T>);
}

/**
 * Format a person's name from an object
 * 
 * @param obj - The object containing name properties
 * @param firstNameKey - The key for the first name
 * @param lastNameKey - The key for the last name
 * @param defaultValue - The default value if name is not available
 * @returns The formatted name
 */
export function formatName(
  obj: any | null | undefined,
  firstNameKey: string = 'first_name',
  lastNameKey: string = 'last_name',
  defaultValue: string = 'Unknown'
): string {
  if (!obj) return defaultValue;
  
  const firstName = safeGet(obj, firstNameKey, '');
  const lastName = safeGet(obj, lastNameKey, '');
  
  if (!firstName && !lastName) return defaultValue;
  
  return `${firstName} ${lastName}`.trim();
}

/**
 * Format a currency amount
 * 
 * @param amount - The amount to format
 * @param currency - The currency code
 * @param locale - The locale to use for formatting
 * @returns The formatted currency amount
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  if (amount === null || amount === undefined) {
    return '';
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(numAmount);
}

/**
 * Format a date
 * 
 * @param date - The date to format
 * @param options - The date formatting options
 * @param locale - The locale to use for formatting
 * @returns The formatted date
 */
export function formatDate(
  date: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  },
  locale: string = 'en-US'
): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Convert snake_case to camelCase
 * 
 * @param str - The string to convert
 * @returns The camelCase string
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 * 
 * @param str - The string to convert
 * @returns The snake_case string
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Transform an object's keys from snake_case to camelCase
 * 
 * @param obj - The object to transform
 * @returns The transformed object
 */
export function transformKeysToCamel<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeysToCamel(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = snakeToCamel(key);
    const value = obj[key];
    
    acc[camelKey] = typeof value === 'object' && value !== null
      ? transformKeysToCamel(value)
      : value;
    
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Transform an object's keys from camelCase to snake_case
 * 
 * @param obj - The object to transform
 * @returns The transformed object
 */
export function transformKeysToSnake<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => transformKeysToSnake(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = camelToSnake(key);
    const value = obj[key];
    
    acc[snakeKey] = typeof value === 'object' && value !== null
      ? transformKeysToSnake(value)
      : value;
    
    return acc;
  }, {} as Record<string, any>);
}
