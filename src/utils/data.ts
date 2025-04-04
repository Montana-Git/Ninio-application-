/**
 * Data handling utility functions
 */

/**
 * Safely get a value from an object with a default fallback
 * 
 * @param obj - The object to get the value from
 * @param path - The path to the value (e.g., 'user.profile.name')
 * @param defaultValue - The default value to return if the path doesn't exist
 * @returns The value at the path or the default value
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return (result === undefined || result === null) ? defaultValue : result as T;
}

/**
 * Safely parse JSON with error handling
 * 
 * @param jsonString - The JSON string to parse
 * @param defaultValue - The default value to return if parsing fails
 * @returns The parsed object or the default value
 */
export function safeParseJSON<T>(jsonString: string, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
}

/**
 * Safely stringify an object to JSON with error handling
 * 
 * @param obj - The object to stringify
 * @param defaultValue - The default value to return if stringification fails
 * @returns The JSON string or the default value
 */
export function safeStringifyJSON(obj: any, defaultValue: string = ''): string {
  if (obj === undefined || obj === null) return defaultValue;
  
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.error('Error stringifying object:', error);
    return defaultValue;
  }
}

/**
 * Safely convert a string to a date with validation
 * 
 * @param dateStr - The date string to convert
 * @param defaultValue - The default value to return if conversion fails
 * @returns The Date object or the default value
 */
export function safeParseDate(dateStr: string | null | undefined, defaultValue: Date = new Date()): Date {
  if (!dateStr) return defaultValue;
  
  try {
    const date = new Date(dateStr);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return defaultValue;
    }
    
    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return defaultValue;
  }
}

/**
 * Safely format a date with fallback
 * 
 * @param date - The date to format
 * @param formatter - The formatting function
 * @param defaultValue - The default value to return if formatting fails
 * @returns The formatted date string or the default value
 */
export function safeFormatDate(
  date: Date | string | null | undefined,
  formatter: (date: Date) => string,
  defaultValue: string = 'Invalid date'
): string {
  if (!date) return defaultValue;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return defaultValue;
    }
    
    return formatter(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return defaultValue;
  }
}

/**
 * Safely access an array element with bounds checking
 * 
 * @param array - The array to access
 * @param index - The index to access
 * @param defaultValue - The default value to return if the index is out of bounds
 * @returns The array element or the default value
 */
export function safeArrayAccess<T>(array: T[] | null | undefined, index: number, defaultValue: T): T {
  if (!array || !Array.isArray(array) || index < 0 || index >= array.length) {
    return defaultValue;
  }
  
  return array[index];
}

/**
 * Safely convert a value to a number with validation
 * 
 * @param value - The value to convert
 * @param defaultValue - The default value to return if conversion fails
 * @returns The number or the default value
 */
export function safeParseNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  try {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  } catch (error) {
    return defaultValue;
  }
}
