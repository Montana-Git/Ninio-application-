/**
 * Security middleware for development environment
 *
 * This module provides security enhancements for the application in development mode.
 * In production, these security measures are handled by the web server (nginx).
 */

import { getEnvVariable } from '@/utils/env';

/**
 * Security header configuration
 */
interface SecurityHeaderConfig {
  name: string;
  content: string;
  description: string;
}

/**
 * Default security headers configuration
 */
const SECURITY_HEADERS: SecurityHeaderConfig[] = [
  {
    name: 'Content-Security-Policy',
    content: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.tempolabs.ai;
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
      font-src 'self' data:;
      connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.tempolabs.ai https://api.groq.com;
      frame-src 'self';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'self';
      object-src 'none';
    `.replace(/\s+/g, ' ').trim(),
    description: 'Controls resources the browser is allowed to load'
  },
  {
    name: 'X-Frame-Options',
    content: 'SAMEORIGIN',
    description: 'Prevents clickjacking attacks by disallowing iframe embedding'
  },
  {
    name: 'X-XSS-Protection',
    content: '1; mode=block',
    description: 'Enables browser XSS filtering'
  },
  {
    name: 'X-Content-Type-Options',
    content: 'nosniff',
    description: 'Prevents MIME type sniffing'
  },
  {
    name: 'Referrer-Policy',
    content: 'strict-origin-when-cross-origin',
    description: 'Controls information sent in the Referer header'
  },
  {
    name: 'Permissions-Policy',
    content: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    description: 'Controls browser features and APIs'
  },
  {
    name: 'Feature-Policy',
    content: "camera 'none'; microphone 'none'; geolocation 'none'",
    description: 'Legacy version of Permissions-Policy'
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    content: 'require-corp',
    description: 'Prevents loading resources that don\'t grant permission'
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    content: 'same-origin',
    description: 'Prevents other domains from opening/controlling window'
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    content: 'same-origin',
    description: 'Prevents other domains from loading resources'
  }
];

/**
 * Apply security headers to the document
 *
 * This function should be called early in the application lifecycle
 * to ensure headers are applied before any content is rendered.
 */
export function applySecurityHeaders(): void {
  // Only apply in browser environment
  if (typeof document === 'undefined') return;

  // Skip in production (headers are added by nginx)
  if (import.meta.env.PROD) return;

  // Get the head element
  const head = document.head || document.getElementsByTagName('head')[0];

  // Add all security headers as meta tags
  SECURITY_HEADERS.forEach(header => {
    // Check if meta tag already exists
    const existingMeta = document.querySelector(`meta[http-equiv="${header.name}"]`);
    if (existingMeta) {
      // Update existing meta tag
      existingMeta.setAttribute('content', header.content);
    } else {
      // Create new meta tag
      const metaTag = document.createElement('meta');
      metaTag.httpEquiv = header.name;
      metaTag.content = header.content;
      head.appendChild(metaTag);
    }
  });

  // Add nonce to scripts if CSP uses nonces
  if (getEnvVariable('VITE_USE_CSP_NONCES', { required: false, defaultValue: 'false' }) === 'true') {
    applyNoncesToScripts();
  }

  console.log('Security headers applied in development environment');
}

/**
 * Apply nonces to inline scripts for CSP
 *
 * This is an advanced security feature that can be enabled
 * by setting VITE_USE_CSP_NONCES=true in .env
 */
function applyNoncesToScripts(): void {
  // Generate a random nonce
  const nonce = generateNonce();

  // Set nonce on all inline scripts
  document.querySelectorAll('script').forEach(script => {
    if (!script.src) {
      script.nonce = nonce;
    }
  });

  // Update CSP header to include nonce
  const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (cspMeta) {
    let cspContent = cspMeta.getAttribute('content') || '';
    cspContent = cspContent.replace(
      "script-src 'self' 'unsafe-inline'",
      `script-src 'self' 'nonce-${nonce}'`
    );
    cspMeta.setAttribute('content', cspContent);
  }
}

/**
 * Generate a random nonce for CSP
 *
 * @returns A random base64 string
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
}

/**
 * Check if the application has all required security headers
 *
 * @returns An object with the security audit results
 */
export function auditSecurityHeaders(): {
  secure: boolean;
  missing: string[];
  recommendations: string[];
} {
  // Only run in browser environment
  if (typeof document === 'undefined') {
    return { secure: false, missing: ['Cannot audit: Not in browser environment'], recommendations: [] };
  }

  const missing: string[] = [];
  const recommendations: string[] = [];

  // Check for each security header
  SECURITY_HEADERS.forEach(header => {
    const metaTag = document.querySelector(`meta[http-equiv="${header.name}"]`);
    if (!metaTag) {
      missing.push(header.name);
    }
  });

  // Add recommendations based on environment
  if (import.meta.env.DEV && missing.length > 0) {
    recommendations.push('Call applySecurityHeaders() early in your application lifecycle');
  }

  if (import.meta.env.PROD && missing.length > 0) {
    recommendations.push('Ensure your web server (nginx) is configured to add security headers');
  }

  // Check for HTTPS in production
  if (import.meta.env.PROD && window.location.protocol !== 'https:') {
    missing.push('HTTPS');
    recommendations.push('Configure your application to use HTTPS in production');
  }

  return {
    secure: missing.length === 0,
    missing,
    recommendations
  };
}
