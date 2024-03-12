# Yoodli take-home: Spotify Catalog Search

# Getting started

Prerequisites:
- Environment variables

To get up and running: clone this repository, run `npm install` and then `npm run start`. The app will be accessible from `http://localhost:5173`.

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