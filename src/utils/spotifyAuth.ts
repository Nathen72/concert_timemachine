const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://127.0.0.1:5173/callback';
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state'
];

// Debug: Log environment variables on module load
console.log('🔧 Environment Check:');
console.log('VITE_SPOTIFY_CLIENT_ID from env:', import.meta.env.VITE_SPOTIFY_CLIENT_ID);
console.log('CLIENT_ID after loading:', CLIENT_ID);
console.log('All import.meta.env:', import.meta.env);

// Generate a cryptographically random code verifier
function generateCodeVerifier(length: number = 128): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Generate code challenge from verifier using SHA-256
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Store code verifier in sessionStorage
function storeCodeVerifier(verifier: string): void {
  sessionStorage.setItem('spotify_code_verifier', verifier);
}

// Retrieve code verifier from sessionStorage
function getCodeVerifier(): string | null {
  return sessionStorage.getItem('spotify_code_verifier');
}

// Clear code verifier from sessionStorage
function clearCodeVerifier(): void {
  sessionStorage.removeItem('spotify_code_verifier');
}

export const getAuthUrl = async (): Promise<string> => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  storeCodeVerifier(codeVerifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });
  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const getAuthorizationCodeFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('code');
};

export const getAuthErrorFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('error');
};

// Exchange authorization code for access token
export const exchangeCodeForToken = async (code: string): Promise<string | null> => {
  const codeVerifier = getCodeVerifier();
  if (!codeVerifier) {
    console.error('Code verifier not found - this usually means the auth flow was interrupted');
    return null;
  }

  // Debug logging
  console.log('🔍 Debug Info:');
  console.log('Client ID:', CLIENT_ID);
  console.log('Redirect URI:', REDIRECT_URI);
  console.log('Code (first 20 chars):', code.substring(0, 20) + '...');
  console.log('Code Verifier exists:', !!codeVerifier);

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Token exchange error:', error);
      console.error('Response status:', response.status);
      console.error('Response statusText:', response.statusText);
      console.error('Full error details:', JSON.stringify(error, null, 2));

      // Clear the code verifier on error so user can try again
      clearCodeVerifier();
      return null;
    }

    const data = await response.json();
    clearCodeVerifier();
    console.log('✅ Successfully exchanged code for token');
    return data.access_token;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    clearCodeVerifier();
    return null;
  }
};
