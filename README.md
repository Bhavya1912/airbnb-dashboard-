# Airbnb Management Console (HTML/CSS/JS)

This repository now includes a lightweight front-end website that connects to your Airbnb backend API for hotel management, booking flow, guests, and admin actions.

## What is included

- `index.html` — single-page management console UI.
- `styles.css` — responsive dashboard styling.
- `app.js` — API integration logic using `fetch` and Bearer auth token.

## Features in UI

- API base URL + token configuration (saved to `localStorage`)
- Auth actions: signup, login, refresh token
- Hotel browsing: search + hotel info
- Booking flow: initialize booking, status, cancellation, my bookings
- Guest management: list, add, update, delete
- Admin quick actions: admin hotels, rooms, inventory, reports
- JSON response viewer for all API calls

## Run locally

Because this is plain HTML/CSS/JS, you can run it with a static server:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://localhost:4173
```

## Notes

- Ensure your backend API enables CORS for the frontend origin.
- Paste your JWT access token into the token field after login if your response format differs.
- Endpoint payloads may require small adjustments to match your backend DTOs exactly.
