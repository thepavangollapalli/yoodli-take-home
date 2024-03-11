import { useNavigate } from 'react-router-dom';
import './App.css'

const CatalogSearch = () => {
  // read token, if it doesn't exist redirect to root
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('access_token');
  if(!accessToken || accessToken === 'undefined') {
    return navigate('/');
  }
  console.log(accessToken)
  const payload: any = {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    }
  }
  fetch("https://api.spotify.com/v1/me/episodes", payload).then(async (data) => {
    console.log(await data.json())
  }).catch((e) => {
    console.error(e)
  })
 
  return (
    <>
      catalog search
    </>
  )
}

export default CatalogSearch;
