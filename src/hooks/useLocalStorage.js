import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      if (item === null || item === undefined || item === 'undefined' || item === 'null' || item === '') {
        return initialValue;
      }
      const parsed = JSON.parse(item);
      if (parsed === null || parsed === undefined) {
        return initialValue;
      }
      if (Array.isArray(initialValue) && !Array.isArray(parsed)) {
        return initialValue;
      }
      if (typeof initialValue === 'object' && initialValue !== null && !Array.isArray(initialValue)) {
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          return initialValue;
        }
        return { ...initialValue, ...parsed };
      }
      return parsed;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
