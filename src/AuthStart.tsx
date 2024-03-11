import { useEffect } from 'react';

import './App.css'

// TODO: document why this is a component and not run in root
const AuthStart = () => {
  // run pkce flow here
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

    // TODO is this the right scope?
    const scope = 'user-library-read';
    const authUrl = new URL("https://accounts.spotify.com/authorize")

    window.localStorage.setItem('code_verifier', codeVerifier);
    const redirectUri = 'http://localhost:5173/callback';

    const params =  {
      response_type: 'code',
      client_id: clientId,
      scope,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: redirectUri,
    }
    console.log(params)

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
    <>
      auth start
    </>
  )
}

export default AuthStart;
