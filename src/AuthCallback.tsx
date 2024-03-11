import { useEffect } from 'react';
import './App.css'
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  let navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  console.log("initialized callback")
  if(!code) {
    // TODO better error handling here?
    navigate('/')
    return;
  }

  const clientId = import.meta.env.YOODLI_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.YOODLI_SPOTIFY_REDIRECT_URI;
  const tokenUrl = new URL("https://accounts.spotify.com/api/token")

  const getToken = async (code: string) => {
    let codeVerifier = localStorage.getItem('code_verifier');

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      } as any),
    }

    console.log("payload", payload)

    const body = await fetch(tokenUrl, payload);
    const response = await body.json();
    console.log(response)
    // TODO need error checking here

    localStorage.setItem('access_token', response.access_token);
  }

  useEffect(() => {
    console.log("before", code)
    getToken(code).then(() => {
      console.log("after processing", localStorage)
      navigate('/search')
    }).catch((e) => {
      console.error(e)
    })
  }, [code])

  return (
    <>
      auth callback
    </>
  )
}

export default AuthCallback;
