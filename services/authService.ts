// Minimal JWT payload decoder (base64url -> JSON) for Google ID tokens
const jwtDecode = (jwt: string): any => {
  const parts = jwt.split('.');
  if (parts.length < 2) throw new Error('Invalid JWT');
  const base64 = parts[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const json = decodeURIComponent(
    atob(padded)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(json);
};

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

type CredentialCallback = (user: AuthUser | null) => void;

/**
 * Initialize Google Identity Services and optionally render a sign-in button.
 * Requires process.env.GOOGLE_CLIENT_ID and the GIS script in index.html.
 */
export const initGoogleAuth = (onCredential: CredentialCallback, buttonElement?: HTMLElement) => {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  if (!clientId) {
    console.warn('GOOGLE_CLIENT_ID is not set');
    return;
  }

  const google = (window as any).google;
  if (!google || !google.accounts || !google.accounts.id) {
    console.warn('Google Identity Services not loaded');
    return;
  }

  google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: any) => {
      try {
        const credential = response?.credential;
        if (!credential) {
          onCredential(null);
          return;
        }
        const payload = jwtDecode(credential);
        const user: AuthUser = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
        };
        onCredential(user);
      } catch (e) {
        console.error('Failed to parse Google credential', e);
        onCredential(null);
      }
    },
  });

  if (buttonElement) {
    google.accounts.id.renderButton(buttonElement, {
      theme: 'outline',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      shape: 'pill',
    });
  } else {
    google.accounts.id.prompt();
  }
};

export const signOutGoogle = () => {
  const google = (window as any).google;
  try {
    google?.accounts?.id?.disableAutoSelect?.();
  } catch {}
};

/**
 * Minimal JWT decoder for GIS ID token payload (no verification). 
 * Avoid extra deps and keep the bundle light.
 */
// no default export