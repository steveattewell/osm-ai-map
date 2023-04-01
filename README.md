# Using AI to get features from OpenStreetMap
This demonstrator connects to GPT-4 from OpenAI and uses it to interpret natural language requests into OpenStreetMap Overpass API queries https://wiki.openstreetmap.org/wiki/Overpass_API . The Overpass API returns features from OpenStreetMap. 
It has varying levels of success depending on what you ask it.

> **Note**
> I am a complete n00b at using GitHub, so bear that in mind!

## What is the role of the A.I. in all of this?
It's important to state that the AI does not actually "get the data from OpenStreetMap". The A.I. interprets what you ask of it "i want to read a book" and uses it's existing knowledge of the OpenStreetMap data structure to write and provide us with a valid (and sometimes invalid!) query to that data. We then fall back to "normal" programming techniques to actually take that query, get the data from OpenStreetMap using Overpass API, and display it on the map. That's where I think these Large Language Model AIs are useful in this context; allowing people who have no knowledge of your data or the technicalities of making calls to your data to get something out of it. 

## Asking the map...
<img width="631" alt="Screenshot 2023-03-28 at 23 43 41" src="https://user-images.githubusercontent.com/21079244/228805890-9fa039d8-616c-47e7-9cd5-10967db53723.png">

## Some results returned...
<img width="639" alt="Screenshot 2023-03-28 at 23 44 17" src="https://user-images.githubusercontent.com/21079244/228805924-50febac4-0fe9-4888-a6cf-e031140ad5c1.png">

You can see a video of an early verison here: https://twitter.com/steveattewell/status/1641060760875933696

## How does it work?
1. It takes any input you give it e.g. "Car parks", or "I want to read a book" and asks chatgpt-4 API to write a filter query 
for the Overpass API 
2. Takes the resultin query that gpt-4 write and then uses that to make a call to Overpass to get features from OpenStreetMap
3. Displays whatever features it recieved on the map (or an error if chatgpt-4 failed to write a great query.

## EXAMPLE: If you centre the map over London and enter: "I want to see a show"

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

So we use the above response from gpt-4 to make this api call:

```https://overpass-api.de/api/interpreter?data=[out:json][timeout:25];(node["amenity"="theatre"](50.8970265077177,-1.412417960123662,50.907072349108745,-1.3853862606643759);way["amenity"="theatre"](50.8970265077177,-1.412417960123662,50.907072349108745,-1.3853862606643759);relation["amenity"="theatre"](50.8970265077177,-1.412417960123662,50.907072349108745,-1.3853862606643759););out;>;out skel qt;```

...which returns a JSON object of theatres and their locations which we convert to geojson and display on the map.

## What is it good / bad at?
It works well if you ask for plain features, or something that it can reasonably easily "translate" into features that exist in OpenStreetMap.
For example if you ask "I want to read a book" chatgpt-4 will assume you're looking for libraries.

It's not so great at more complex filtering like "buildings over 5 meters tall". 
However, next step is to give it some hints as to how to do better filtering in the prompt that is sent to the AI.

## How to set up the project
You will need to edit ```api-keys.js``` to include:
1. An api key from OpenAI https://platform.openai.com/account/api-keys
2. An api key for maptiler https://cloud.maptiler.com/account/keys/
3. And you'll also need access to the GPT-4 API which currently has a waitlist: https://openai.com/waitlist/gpt-4-api 

**You should NEVER disclose your API keys publicly, 
or release this project live as your API keys will be exposed. This means 
other will be able to see your API keys and use them, potentially costing you money.**

OpenAI's gpt-4 is used as the artificial intelligence https://openai.com/pricing , and Maptiler offer a service which shows the OpenStreetMap basemap. Maptiler have a free tier which is plenty if you're developing locally https://www.maptiler.com/cloud/pricing/ 

## Do not publish this project live in its current state

This project is deliberately a bare-bones demonstrator using vanilla HTML, CSS and Javascript. It makes no effort to secure your API keys.

If you make your version publicly available you'll be exposing your API keys which would allow 
others to use them, and potentially spend your money! If you want to make a publishable version of this you 
need to put the work in to some server-side development to secure your API keys.

# I'm a UX designer Jim, not a developer
So if you have suggestions or comments or want to make a better version, please do. 

## What could you investigate?

I'd be very interested to see if you can improve the OpenAI prompt to help it return valid results from more complex natrual language requests
such as "Buildings that are over 3m tall", or "buildings within 20 meters of roads".
Because that's what I'm going to be looking at next. There is some info about more complex 
filtering of Overpass Turbo API calls here: http://dev.overpass-api.de/blog/numbers.html

## Technologies and tools used
**OpenAI  https://openai.com/** - an artificial intelligence research organization that develops and promotes AI in an open and responsible manner.

**OpenStreetMap https://www.openstreetmap.org/** - a collaborative and open-source mapping platform where anyone can contribute and edit geographic data from around the world.

**Overpass Turbo https://overpass-turbo.eu/** - a web-based tool and API that allows users to query and extract data from OpenStreetMap in various formats.

**MapLibre  https://maplibre.org/** - a free and open-source map javascript (and native) library that enables users to create and display custom maps on websites and mobile apps.

**Maptiler https://www.maptiler.com/** - a cloud-based mapping platform that provides tools to create, host, and distribute custom maps and geospatial data.

Cheers,

Steve https://twitter.com/steveattewell
