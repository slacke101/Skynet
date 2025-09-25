# SkyNet – Smart Layover & Live-Flight Companion

SkyNet is a personal capstone project (Oregon State University, CS) that tackles two common pain-points of air travel in one modern web app.

# Click Link to visit Skynet https://skynet-green.vercel.app/ #

## Features

### 1. Layover Assistant

- Type-ahead airport search (global list).
- Inputs: arrival / departure airports, seat row, layover minutes, same-terminal toggle.
- FastAPI micro-service estimates the probability of making the connection — factoring de-plane time, walking time, and a logistic heuristic tuned with real-world data.
- Animated sky background, responsive card UI.

### 2. Live Flight Tracking

- 3-D Cesium globe fed by **OpenSky Network** real-time ADS-B feed.
- Click any aircraft for callsign, altitude, route; deep-link to a dedicated details page.
- **SkyBot** chat (OpenAI GPT-3.5) answers “Where is DAL123?” or explains app features.

## Tech Stack

| Layer     | Tech                                                   |
| --------- | ------------------------------------------------------ |
| Front-end | React + Vite, Framer-Motion, react-select, Cesium      |
| API Proxy | Node / Express (airport search, OpenSky caching, chat) |
| Micro-svc | Python FastAPI (layover prediction)                    |
| Data      | OpenSky REST API, global airport JSON, heuristic model |
| Styling   | Plain CSS, radial / linear gradients, glassy cards     |

## Goals

- Give travelers a quick, data-driven answer to **“Will I make this connection?”**
- Showcase full-stack skills: REST, live data caching, AI integration, 3-D viz, responsive design.
- Deployable 100 % free tier: **Vercel** (front-end) + **Fly.io/Railway** (back-end).

## Environment Variables / API Keys

SkyNet needs a few keys to run locally or in production. Create a `.env` file in the project root (both Node and FastAPI read from process env).

| Variable                                           | Where to get it                                                    | Used by                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `OPENAI_API_KEY`                                   | https://platform.openai.com/account/api-keys                       | Express `/api/chat` (SkyBot)                                     |
| `OPENSKY_USERNAME` & `OPENSKY_PASSWORD` (optional) | https://opensky-network.org/ (register)                            | Node proxy for higher rate-limit; leave empty for anonymous mode |
| `LAYOVER_MODEL_PATH` (optional)                    | Path to `layover_model.joblib` (default `ml/layover_model.joblib`) | FastAPI micro-service                                            |

```bash
# example .env (place in project root)
OPENAI_API_KEY=sk-xxxxxx
# anonymous OpenSky is fine for demo, but you can add:
OPENSKY_USERNAME=myuser
OPENSKY_PASSWORD=secret
```

Vercel / Fly.io: add the same variables in their dashboard under _Environment Variables_ before deploying.

## Local Setup

```bash
# clone & install
npm install             # front-end deps

# run front-end
npm run dev             # http://localhost:5173

# run Node proxy (airport search, chat, OpenSky cache)
cd server
npm install
node server.js          # http://localhost:3001

# run FastAPI micro-service (layover prediction)
cd ml
pip install -r requirements.txt
python serve.py         # http://localhost:8000
```

Open the browser, explore live flights, and test your next layover. Good luck & happy travels!

