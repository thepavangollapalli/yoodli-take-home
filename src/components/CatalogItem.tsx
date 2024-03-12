import { useEffect, useState } from "react";
import { sleep } from "../utils/sleep";

const getArtistGenre = async (href: string) => {
  const accessToken = localStorage.getItem('access_token');
  const payload: any = {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    }
  }
  let response = await fetch(href, payload);
  if (response.status == 429) {
    const retryAfterSeconds = parseInt(response.headers.get('retry-after') ?? '')
    console.log(`Rate limited, sleeping for ${retryAfterSeconds} seconds`)
    await sleep(retryAfterSeconds * 1000)
    response = await fetch(href, payload);
  }
  const body: any = await response.json();
  if(body.genres){
    return body.genres;
  }
  return [];
}

export const CatalogItem = (props: any) => {
  const { item } = props;
  let [image, setImage] = useState<any>(null);
  let [genres, setGenres] = useState([]);
  useEffect(() => {
    if(item.type === "album") {
      // grab thumbnail images to speed up load times
      setImage(item.images.filter((image: any) => image.height === 64)[0]);
      getArtistGenre(item.artists[0].href).then((genres) => setGenres(genres))
    }
    if (item.type === "track") {
      console.log(item.name, item.artists[0].href)
      setImage(item.album.images.filter((image: any) => image.height === 64)[0]);
      getArtistGenre(item.artists[0].href).then((genres) => setGenres(genres))
    }
    if (item.type === "episode") {
      setImage(item.images.filter((image: any) => image.height === 64)[0]);
    }
  }, [])

  return (
    <div className="catalog-item">
      <img src={image?.url} />
      <p>{item.name}</p>
      <p>{genres.length > 0 ? genres.join(", ") : 'No genres found'}</p>
      <p>{item.type}</p>
    </div>
  )
}