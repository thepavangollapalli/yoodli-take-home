# Yoodli take-home: Spotify Catalog Search

# Getting started

To get up and running: clone this repository, run `npm install` and then `npm run start`. The app will be accessible from `http://localhost:5173`.

# Design Notes and Reflections
A lot of this app is as barebones as possible. The main external libraries I added to this project are Vite and React Router, both of which supply essential functionality like building the project and adding support for routing. I considered more batteries-included frameworks like Remix and Next.js but decided they had too many extras for a project as basic as this one.

The entrypoint for the project is in `main.tsx`, where the different routes for the project are defined. The project defaults to displaying a login page in the App component, which then flows into the AuthStart and AuthCallback components to implement the two halves of the PKCE flow. After the access token is successfully received, we load the CatalogSearch component to do the fun stuff.

If I could redo this project, the main thing I would do differently is testing out my interactions with the Spotify API in a sandbox before diving into implementation. I chose to use Spotify's `search` endpoint in conjunction with the `check if X is saved` endpoints for each type of resource, thinking that Spotify's search would be more efficient than iterating through all saved items and doing a string match. This turned out to be the wrong move for two main reasons: I had to do hundreds of `check if X is saved` calls for each search, leading to rate limiting by the API, and (more importantly) Spotify paginates each type of resource within the search rather than the search itself. In other words, rather than returning 100 search results and saying that 500 are left, it returns something like the following:
```
{
  "albums": {
    "href": "https://api.spotify.com/v1/search?query=What&type=album&locale=en-US%2Cen%3Bq%3D0.5&offset=0&limit=50",
    "items": [],
    "limit": 50,
    "next": "https://api.spotify.com/v1/search?query=What&type=album&locale=en-US%2Cen%3Bq%3D0.5&offset=50&limit=50",
    "offset": 0,
    "previous": null,
    "total": 406
  },
  "tracks": {
    "href": "https://api.spotify.com/v1/search?query=What&type=track&locale=en-US%2Cen%3Bq%3D0.5&offset=0&limit=50",
    "items": [],
    "limit": 50,
    "next": "https://api.spotify.com/v1/search?query=What&type=track&locale=en-US%2Cen%3Bq%3D0.5&offset=50&limit=50",
    "offset": 0,
    "previous": null,
    "total": 1000
  },
  "episodes": {
    "href": "https://api.spotify.com/v1/search?query=What&type=episode&locale=en-US%2Cen%3Bq%3D0.5&offset=0&limit=50",
    "items": [],
    "limit": 50,
    "next": "https://api.spotify.com/v1/search?query=What&type=episode&locale=en-US%2Cen%3Bq%3D0.5&offset=50&limit=50",
    "offset": 0,
    "previous": null,
    "total": 1000
  }
}
```
When making subsequent API requests, it is not possible to specify an offset for each type of item. I could not come up with a good solution to this in a reasonable amount of time, and I don't have enough time to rewrite my data fetching to go through a user's saved items instead of via the `search` endpoint. This is the main thing I would rework if I had more time on this project.

Another issue I did not have time to address is the lack of error handling - I put in error handling for rate limiting errors, but wasn't able to implement error handling for 401 Unauthorized errors (which I would handle by using the refresh token to request a new access token) and gracefully handling unexpected errors throughout the project.

# Transcription Implementation

There are two main routes for displaying lyric transcription for a song:
- Fetch lyrics from a third-party source like Musixmatch (this is what Spotify does today)
- Extract the lyrics ourselves

For the route of getting lyrics for a song, most songs have lyrics available on Musixmatch or other services like Genius and can be fetched via scraping or API calls. We'd need to deal with concerns like legality of potentially scraping lyrics, missing lyrics for the long tail of songs and potential cost scaling with API use (depending on the API). Depending on our prioritization of this use case this might be good enough for us.

Assuming we want to extract the lyrics ourselves given a full song or music video file, there are a few different questions we would want to ask first:
- how do we want to split up the work of processing the audio between the backend and the frontend?
- how much do we want to involve third party services (build vs buy)?
  - [GCP](https://cloud.google.com/speech-to-text), [Azure](https://azure.microsoft.com/en-us/products/ai-services/speech-to-text) and [AWS](https://aws.amazon.com/transcribe/) all offer full speech to text services
  - Open source libraries like [DeepSpeech](https://github.com/mozilla/DeepSpeech), [Kaldi](https://github.com/kaldi-asr/kaldi), [CMU Sphinx](https://cmusphinx.github.io/)
  - Browser-based standard APIs like the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
  - building and training a custom model or calling out to ChatGPT
- should we process the whole file at once or can we do it in chunks?
- What are the accuracy/performance/cost tradeoffs of different approaches?

I think that a lot of the above questions require a bit more discussion, experimentation, and research to properly answer. Rather than get bogged down in that at this point, let's talk through what a good UX for this should look like. I think we should optimize for two use cases:
1. When starting the song/video and playing sequentially from the start, we see lyrics show up as we go
2. If we skip to a specific section of the song/video, lyrics for that part start showing up

In both cases, the wait should be as small as possible.

These use cases lead me to think that the best approach is to split up our audio into chunks and feed them into our transcription logic (wherever it lives) chunk by chunk. This way, we can start seeing lyrics show up as quickly as possible when the song starts playing and if we skip ahead to a specific chunk of the song we can quickly fetch lyrics for that as well by sending that specific chunk to get transcribed. The tradeoff of this approach is that we aren't able to analyze the entire song in one go and will have to wait for all chunks to get transcribed, but I don't think the (possibly negligible) extra cost of waiting for all chunks will outweigh the benefits of having a snappy UI when playing and skipping through the song. Of course, this is all based on my assumption of what the highest priority use cases for our app are - I would rather discuss this more with my team and ideally some end users before going further into implementation.
