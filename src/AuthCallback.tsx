import { useEffect } from 'react';
import './App.css'
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  let navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  if(!code) {
    // TODO better error handling here?
    navigate('/')
    return <div></div>;
  }

  const clientId = import.meta.env.YOODLI_SPOTIFY_CLIENT_ID;
  const redirectUri = import.meta.env.YOODLI_SPOTIFY_REDIRECT_URI;
  const tokenUrl = "https://accounts.spotify.com/api/token"

  const getToken = async (code: string, controller?: AbortController) => {
    const codeVerifier = localStorage.getItem('code_verifier');

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
      signal: controller?.signal || null,
    }

    const body = await fetch(tokenUrl, payload)
    const response = await body.json();
    // TODO need error checking here

    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token)
  }

  useEffect(() => {
    let controller: any;
    // we need AbortController to cancel duplicate API requests made when React is running in strict mode
    // this is only a problem in lower envs, and only implemented here as duplicate requests break the auth flow
    if(!import.meta.env.PROD) {
      controller = new AbortController();
    }
    getToken(code, controller).then(() => {
      return navigate('/search');
    }).catch((e) => {
      console.error(e)
    })

    return () => controller.abort()
  }, [code])

  return (
    <div></div>
  )
}

export default AuthCallback;
