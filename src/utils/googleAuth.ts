/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DecodedGoogleUser {
  iss: string;
  nbf: number;
  aud: string;
  sub: string; // Unique Google User ID
  email: string;
  email_verified: boolean;
  azp: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
  jti: string;
}

/**
 * Decodes a Google Sign-In ID Token (JWT) securely on the client side.
 * Converts the Base64Url payload to a standard JSON object supporting UTF-8 characters.
 */
export function decodeGoogleCredential(credential: string): DecodedGoogleUser {
  const parts = credential.split('.');
  if (parts.length !== 3) {
    throw new Error('Formato JWT inválido');
  }
  
  // Base64Url to Base64 mapping
  const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  
  // Safe Unicode decoding
  const jsonPayload = decodeURIComponent(
    atob(payloadBase64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  
  return JSON.parse(jsonPayload);
}

// Global TypeScript definitions for Google Identity Services (GIS) library to ensure seamless compilations
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: any) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string;
              locale?: string;
            }
          ) => void;
          prompt: (callback?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
