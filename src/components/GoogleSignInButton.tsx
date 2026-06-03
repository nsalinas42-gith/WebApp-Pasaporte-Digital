/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { decodeGoogleCredential, DecodedGoogleUser } from '../utils/googleAuth';
import { Sparkles, Mail } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess: (decodedUser: DecodedGoogleUser, rawToken: string) => void;
  onError?: (error: any) => void;
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: string;
  className?: string;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  theme = 'outline',
  size = 'large',
  text = 'signin_with',
  shape = 'pill',
  width = '100%',
  className = ''
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGisLoaded, setIsGisLoaded] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Read Google Client ID from environment variables
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let checkInterval: any;
    let attempts = 0;

    const initializeGis = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id) {
        setIsGisLoaded(true);
        clearInterval(checkInterval);
        return true;
      }
      return false;
    };

    // Check if GIS is loaded already
    if (!initializeGis()) {
      checkInterval = setInterval(() => {
        attempts++;
        if (initializeGis()) {
          clearInterval(checkInterval);
        } else if (attempts > 30) {
          // 3 seconds timeout
          clearInterval(checkInterval);
          setInitError('No se pudo cargar el SDK de Google Identity Services. Verifica tu red.');
          if (onError) onError('SDK_LOAD_FAILED');
        }
      }, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [onError]);

  useEffect(() => {
    if (!isGisLoaded || !containerRef.current) return;

    if (!googleClientId || googleClientId.includes('your-google-client-id')) {
      // Not yet configured by the developer/user
      return;
    }

    try {
      const handleCredentialResponse = (response: any) => {
        if (!response.credential) {
          throw new Error('No se recibió la credencial de Google.');
        }

        try {
          const decoded = decodeGoogleCredential(response.credential);
          onSuccess(decoded, response.credential);
        } catch (decErr) {
          console.error('Error decodificando Google token:', decErr);
          setInitError('Error al procesar los datos recibidos de Google.');
          if (onError) onError(decErr);
        }
      };

      // Initialize the Google Accounts ID library
      window.google!.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: true
      });

      // Render the button inside the ref element
      window.google!.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: theme,
        size: size,
        text: text,
        shape: shape,
        logo_alignment: 'left',
        width: width === '100%' ? undefined : width,
        locale: 'es_ES'
      });

      // Optional: Trigger Google One Tap Prompt
      window.google!.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log('One Tap no se muestra:', notification.getNotDisplayedReason());
        }
      });
    } catch (err: any) {
      console.error('Error inicializando el botón de Google Sign-In:', err);
      setInitError('Excepción en inicialización del widget.');
      if (onError) onError(err);
    }
  }, [isGisLoaded, googleClientId, theme, size, text, shape, width, onSuccess, onError]);

  // If client ID is missing/default, render a helpful configuration prompt so they can simulate or set up
  if (!googleClientId || googleClientId.includes('your-google-client-id')) {
    const handleSimulatedSignIn = () => {
      // Simulate premium traveler login details so they can test the flow smoothly
      const simulatedUser: DecodedGoogleUser = {
        iss: 'https://accounts.google.com',
        nbf: Date.now() / 1000 - 60,
        aud: 'simulated-client-id',
        sub: '1234567890987654321',
        email: 'viajero.aventurero@gmail.com',
        email_verified: true,
        azp: 'simulated-client-id',
        name: 'Carlos "Andino" Salinas',
        picture: '/src/assets/images/avatar_hombre_2.png', // Uses uploaded avatar
        given_name: 'Carlos',
        family_name: 'Salinas',
        iat: Date.now() / 1000 - 60,
        exp: Date.now() / 1000 + 3600,
        jti: 'simulated-jti-token-id-9988'
      };
      
      onSuccess(simulatedUser, 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.simulated_jwt_token.signature');
    };

    return (
      <div className={`p-4 bg-[#001721] rounded-2xl border border-[#005049]/30 text-center space-y-3 shadow-md max-w-sm ${className}`}>
        <div className="flex items-center gap-2 justify-center text-xs text-[#43e5d4]/80 font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-[#43e5d4]" />
          <span>Servicio Google Sign-In</span>
        </div>
        <p className="text-[11px] text-[#c8e7fb]/60 leading-normal">
          Para ver el botón oficial de Google en producción, añade tu <strong>VITE_GOOGLE_CLIENT_ID</strong> en tus secretos (.env) de AI Studio.
        </p>
        <button
          type="button"
          onClick={handleSimulatedSignIn}
          title="Simular un inicio de sesión de Google con estas credenciales"
          className="w-full py-2.5 px-4 bg-[#103e44]/95 hover:bg-[#1a5b63] border border-[#43e5d4]/40 active:scale-[0.98] transition-all text-xs font-bold rounded-full text-secondary flex items-center justify-center gap-2 select-none cursor-pointer"
        >
          <Mail className="w-4 h-4 text-secondary" />
          <span>Probar Simulación (Google Sign-In)</span>
        </button>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="text-xs text-error bg-error-container/10 border border-error/30 p-3 rounded-xl">
        ⚠️ {initError}
      </div>
    );
  }

  return (
    <div className={`flex justify-center select-none ${className}`}>
      {/* Container div targeted by Google Accounts API script wrapper */}
      <div 
        ref={containerRef} 
        id="google-signin-element" 
        className="min-h-[44px] transition-all overflow-hidden inline-block"
        style={{ minWidth: size === 'large' ? '240px' : '200px' }}
      >
        {!isGisLoaded && (
          <div className="flex items-center gap-2 justify-center py-2.5 px-4 bg-[#103e44]/20 border border-[#43e5d4]/20 rounded-full text-xs text-on-surface-variant animate-pulse font-sans">
            <span className="w-3.5 h-3.5 border-2 border-t-transparent border-secondary rounded-full animate-spin"></span>
            <span>Cargando Google Sign-In...</span>
          </div>
        )}
      </div>
    </div>
  );
}
