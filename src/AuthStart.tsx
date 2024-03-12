import { useEffect } from 'react';

import './App.css'

// This is a separate component mainly due to wanting to keep this auth logic separate from
// the route definition and home page logic - there is no functional benefit, but it will be easier to maintain
// as it creates a logical separate for all logic related to this part of the auth flow.
const AuthStart = () => {
  const clientId = import.meta.env.YOODLI_SPOTIFY_CLIENT_ID

  const generateRandomString = (length: number) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  }

  const codeVerifier  = generateRandomString(64);

  const sha256 = async (plain: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
  }

  const base64encode = (input: ArrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  const initializeAuth = async () => {
    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed);

    const scope = 'user-library-read';
    const authUrl = new URL("https://accounts.spotify.com/authorize")

    window.localStorage.setItem('code_verifier', codeVerifier);
    const redirectUri = import.meta.env.YOODLI_SPOTIFY_REDIRECT_URI;

    const params =  {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    }

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  }

  useEffect(() => {
    initializeAuth().then(() => {
      // this will never run, as the flow will redirect to /callback
    }).catch(e => {
      console.error(e)
    })
  }, [])

  return (
    <div></div>
  )
}

export default AuthStart;
