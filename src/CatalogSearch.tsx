import { useNavigate } from 'react-router-dom';
import './App.css'
import { useEffect, useState } from 'react';
import { CatalogItem } from './components/CatalogItem';
import { sleep } from './utils/sleep';

const API_BASE_URL = 'https://api.spotify.com/v1';

const CatalogSearch = () => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('access_token');
  if(!accessToken || accessToken === 'undefined') {
    navigate('/');
    return <div></div>
  }

  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const allowedItemTypes = ["album","track","episode"]
  let debounceTimeout: NodeJS.Timeout;

  const checkAndUpdateSearchResult = async (item: any, type: string) => {
    // TODO: refactor check into a helper
    let checkUrl = `${API_BASE_URL}/me/${type}/contains?`
    const payload: any = {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      }
    }
    const params = new URLSearchParams({
      "ids": item.id
    } as any)
    const response = await fetch(checkUrl + params, payload)

    // TODO error handling, specifically response.status 401 - need to use refresh token
    const checkResult = await response.json()
    if(checkResult.length > 0 && checkResult[0] === true) {
      setSearchResults(searchResults => searchResults.concat([item]))
    }
  }

  // TODO make type for items
  const processSearchResults = async (items: any) => {
    for(let itemType of allowedItemTypes) {
      const pluralItemType = itemType + "s"
      // TODO handle offset tracking here
      const results = items[pluralItemType]?.items
      await Promise.all(results.map(async (item: any) => 
        await checkAndUpdateSearchResult(item, pluralItemType),
        await sleep(750),
      ));
    }
  }

  useEffect(() => {
    const searchSavedItems = async (query: string) => {
      if (!query) {
        return;
      }
      setSearchResults([]);
      const payload: any = {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        }
      }

      const params = new URLSearchParams({
        "q": query,
        "type": allowedItemTypes.join(","),
        "limit": 50,
        "include_external": "true"
      } as any)
      fetch(API_BASE_URL + "/search?" + params, payload).then(async (data) => {
        const searchResults = await data.json()
        await processSearchResults(searchResults);
      }).catch((e) => {
        console.error(e)
      })
    }

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      searchSavedItems(searchQuery);
    }, 500);

    // Cleanup function to clear debounceTimeout on unmount or when query changes
    return () => {
      clearTimeout(debounceTimeout);
      setSearchResults([]);
    };
  }, [searchQuery]);

  const fancySearchResults = searchResults.map((result) => {
    return (
      <CatalogItem item={result} key={result.id} />
    );
  })

  return (
    <div className="search-page">
      <header className="header">
        <h3>Spotify Catalog Search</h3>
        <input type="text" placeholder="Search your saved items" onChange={(e) => setSearchQuery(e.target.value)}></input>
      </header>
      <div className="catalog-container">
        {fancySearchResults}
      </div>
    </div>
  )
}

export default CatalogSearch;
