# Portfolio Frontend

Personal portfolio with dynamic content, hover effects, and audio playback.

## Tech Stack
- HTML5 / CSS3 / JavaScript
- No frameworks

## Features
- Dynamic stats from backend API
- Hover overlays with GIFs (city, song, game)
- Audio playback on song hover (resumes on re-hover)
- Scroll fade-in animations
- Mobile touch support
- Background color transitions per section

## Structure
```
├── index.html
├── css/styles.css
├── js/main.js
├── img/
│   ├── hyderabad.gif
│   ├── gintamaBreakDancing.gif
│   ├── counterStrike2.gif
│   └── meta.png
└── Assets/
    └── resume.pdf
```

## Run
```bash
# Using Live Server (VS Code) or any static server
npx serve .
```

## API Dependency
Requires backend running at `http://localhost:8081/api/stats`

## Config
Update `js/main.js` line 5 for production:
```javascript
const API_URL = 'https://yourdomain.com/api/stats';
```
