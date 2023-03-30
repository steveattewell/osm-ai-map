# osm-ai-map
This demonstrator connects to GPT-4 from OpenAI and uses it to interpret natural language requests into OpenStreetMap Overpass Turbo queries https://wiki.openstreetmap.org/wiki/Overpass_API . The Overpass Turbo API returns features from OpenStreetMap. 
It has varying levels of success depending on what you ask it.

## Asking the map...
<img width="631" alt="Screenshot 2023-03-28 at 23 43 41" src="https://user-images.githubusercontent.com/21079244/228805890-9fa039d8-616c-47e7-9cd5-10967db53723.png">

## Some result returned...
<img width="639" alt="Screenshot 2023-03-28 at 23 44 17" src="https://user-images.githubusercontent.com/21079244/228805924-50febac4-0fe9-4888-a6cf-e031140ad5c1.png">

You can see a video of an early verison here: https://twitter.com/steveattewell/status/1641060760875933696

## How does it work?
1. It takes any input you give it e.g. "Car parks", or "I want to read a book".
2. It takes your input and asks chatgpt-4 API to write a filter query 
for the Overpass Turbo API 
3. Takes the result from chatgpt-4 and then uses that to make a call to Overpass Turbo tog et features from OpenStreetMap
4. Displays whatever features it recieved on the map (or an error if chatgpt-4 failed to write a great query.

## If you centre the map over London and enter: "I want to see a show"

we ask chatgpt-4 AI:

```
Write me a data query for Open Streetmap that returns common 
features known to exist in the OpenStreetMap database that are 
related to the term "i want to see a show" within this 
bounding-box 50.8970265077177,-1.412417960123662,50.907072349108745,-1.3853862606643759 .
Respond with just the "data" part of the querystring on a single 
line and no explanation. Format your response like 
this: data=[out:json][timeout:25];{INSERT_QUERY_HERE};out;>;out skel qt;
```

The AI returns:

```data=[out:json][timeout:25];(node["amenity"="theatre"](50.8970265077177,-1.412417960123662,50.907072349108745,-1.3853862606643759);way["amenity"="theatre"](50.8970265077177,-1.412417960123662,50.907072349108745,-1.3853862606643759);relation["amenity"="theatre"](50.8970265077177,-1.412417960123662,50.907072349108745,-1.3853862606643759););out;>;out skel qt;```

So we make this api call:

```https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node["amenity"="theatre"](50.8970265077177,-1.412417960123662,50.907072349108745,-1.3853862606643759);way["amenity"="theatre"](50.8970265077177,-1.412417960123662,50.907072349108745,-1.3853862606643759);relation["amenity"="theatre"](50.8970265077177,-1.412417960123662,50.907072349108745,-1.3853862606643759););out;>;out skel qt;```

...which returns a JSON object of results which we convert to geojson and display on the map.

## What is it good / bad at?
It works well if you ask for plain features, or something that it can reasonably easily "translate" into features that exist in OpenStreetMap.
For example if you ask "I want to read a book" chatgpt-4 will assume you're looking for libraries.

It's not so great at more complex filtering like "buildings over 5 meters tall". 
However, next step is to give it some hints as to how to do better filtering in the prompt that is sent to the AI.

## How to set up the project
You will need to edit ```api-keys.js``` to include:
1. An api key from OpenAI https://platform.openai.com/account/api-keys
2. An api key for maptiler https://cloud.maptiler.com/account/keys/

**You should NEVER disclose your API keys publicly, 
or release this project live as your API keys will be exposed. This means 
other will be able to see your API keys and use them, potentially costing you money.**

3. And you'll also need access to ChatGPT-4 API which currently has a waitlist. https://openai.com/waitlist/gpt-4-api

OpenAI is used as the Artificail intelligence, and Maptiler offer a service which shows the OpenStreetMap basemap. Maptiler have a free tier which is plenty if you're developing locally.

## Do not publish this project live in its current state

This project is deliberately bare-bones using vanilla HTML, CSS and Javascript. It makes no effort to secure your API keys.

If you make your version publicly available you'll be exposing your API keys which would allow 
others to use them, and potentially spend your money! This project is a demonstrator and as such 
does not put any work is securing API keys. If you want to make a publishable version of this you 
need to put the work into some server-side development to secure your API keys.

# I'm not a developer, really
So if you have suggestions or comments or want to make a better version, please do. 

## What could you investigate?

I'd be very interested to see if you can improve the OpenAI prompt to make the call return more complex results
from requests like "Buildings that are over 3m tall", or "buildings within 20 meters of roads".
Because that's what I'm going to be looking at next. There is some info about more complex 
filtering of Overpass Turbo API calls here: http://dev.overpass-api.de/blog/numbers.html

Steve https://twitter.com/steveattewell
