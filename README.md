# Sofie touch

A touchscreen for firing Sofie adlibs. This app listens to the Live Status Gateway and sends actions through Sofie's OpenAPI.

## Start Sofie

Docker is required.

```bash
docker compose up -d
```

The live-status-gateway container restarts until the snapshots below are loaded. That is expected.

1. Open http://localhost:3000/settings/tools/snapshots?admin=1
2. Upload `system-snapshot.json`, then `rundown-snapshot.json`.
3. Open http://localhost:3000, enter the rundown, right-click the blue bar, and choose **Activate**.
4. Take the first part: right-click the bar and choose **Take**, or press F12.

Sofie OpenAPI: http://localhost:3000/api/v1.0

Live Status Gateway websocket: ws://localhost:8080

## Start this app

The touch app lives in `web-app/`. From the repository root:

```bash
npm i
npm run dev
```

The dev server proxies `/api` to Sofie on port 3000.
