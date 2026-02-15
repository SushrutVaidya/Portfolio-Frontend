# Portfolio Frontend

Personal portfolio landing page with dynamic content, hover effects, audio playback, and rickroll counter.

## Tech Stack
- HTML5 / CSS3 / JavaScript
- Nginx (for Docker deployment)
- No frameworks - vanilla JavaScript

## Features
- **Dynamic stats** from backend API (location, game, time, song)
- **Hover overlays** with GIFs (city, song, game)
- **Audio playback** on song hover (resumes on re-hover)
- **Rickroll counter** tracks total clicks across all users
- **Scroll fade-in animations** for smooth UX
- **Mobile touch support** for overlays
- **Background color transitions** per section
- **Responsive design** works on all devices

## Structure
```
├── index.html              # Main HTML
├── css/styles.css          # All styles
├── js/main.js              # Main logic & API integration
├── img/
│   ├── hyderabad.gif       # City hover overlay
│   ├── gintamaBreakDancing.gif  # Song hover overlay
│   ├── counterStrike2.gif  # Game hover overlay
│   └── meta.png            # Social media preview
├── assets/
│   └── resume.pdf          # Downloadable resume
├── nginx.conf              # Nginx configuration for Docker
└── dockerfile              # Docker container config
```

## Run Locally

### Using Live Server (VS Code)
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Using npx serve
```bash
npx serve .
```

### Using Python
```bash
# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Access at `http://localhost:8080`

## Docker

### Build
```bash
docker build -t portfolio-frontend .
```

### Run
```bash
docker run -p 8080:8080 portfolio-frontend
```

Access at `http://localhost:8080`

## Configuration

### Backend API URL
Update `js/main.js` to point to your backend:

**Local Development:**
```javascript
const API_URL = 'http://localhost:8081/api';
```

**Production:**
```javascript
const API_URL = 'https://your-backend-domain.com/api';
```

### Environment-specific Config
For Docker deployment, you can use environment variables or update the API URL at build time.

## API Integration

The frontend connects to the backend for:

### GET `/api/stats`
Fetches dynamic portfolio stats:
- Current location
- Current game playing
- Current time
- Song of the hour (with audio URL)

### POST `/api/rickroll`
Increments and returns the rickroll counter when user clicks the rickroll link.

## Features in Detail

### Dynamic Content
- Stats refresh from backend API on page load
- Time updates every second
- Song changes every 4 hours based on backend rotation

### Hover Effects
Three hoverable stats with GIF overlays:
1. **Location** - Shows city GIF
2. **Song** - Shows music GIF + plays audio
3. **Game** - Shows game GIF

### Audio Playback
- Audio plays when hovering over "Song" stat
- Pauses when hover ends
- Resumes from last position on re-hover
- Audio files served from backend at `/audio/`

### Rickroll Counter
- Tracks total clicks across all users
- Updates in real-time
- Persists with Redis backend (or in-memory without Redis)
- Shows "You're rickroll victim #X!" message

### Scroll Animations
- Fade-in effect as sections enter viewport
- Smooth transitions for better UX
- Works on mobile and desktop

## Deployment

### Docker (Recommended)
```bash
# Build
docker build -t portfolio-frontend .

# Run
docker run -p 8080:8080 portfolio-frontend
```

### Docker Compose
Use with backend in `docker-compose.yml`:
```yaml
version: '3.8'
services:
  frontend:
    build: ./portfolio-frontend
    ports:
      - "8080:8080"
  backend:
    build: ./Portfolio-Backend
    ports:
      - "8081:8081"
```

### AWS EC2
See `AWS_DEPLOYMENT_GUIDE.md` in parent directory for complete deployment instructions.

### Static Hosting
Can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

**Note:** Update API_URL to point to your deployed backend.

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance
- Optimized images (GIFs compressed)
- Minimal JavaScript (vanilla, no frameworks)
- Nginx gzip compression enabled
- Cache headers for static assets
- Small Docker image size (~50 MB)

## Development

### File Watching
Use a dev server with hot reload:
```bash
npx live-server .
```

### Debugging
Open browser DevTools (F12):
- Console tab for API errors
- Network tab for API requests
- Elements tab for CSS debugging

### Testing API Integration
```bash
# Test backend is running
curl http://localhost:8081/api/stats

# Test rickroll endpoint
curl http://localhost:8081/api/rickroll
```

## Customization

### Change Colors
Edit `css/styles.css`:
```css
:root {
  --primary-color: #your-color;
  --secondary-color: #your-color;
}
```

### Change Content
Edit `index.html`:
- Update name, title, bio
- Add/remove sections
- Change social links

### Change Backend URL
Edit `js/main.js`:
```javascript
const API_URL = 'https://your-backend.com/api';
```

## Troubleshooting

### Stats Not Loading
- Check backend is running: `curl http://localhost:8081/api/stats`
- Check API_URL in `js/main.js` is correct
- Check browser console for CORS errors
- Verify backend CORS configuration

### Audio Not Playing
- Check audio files exist in backend at `/audio/`
- Check browser console for 404 errors
- Some browsers block autoplay - user interaction required

### Rickroll Counter Shows "undefined"
- Check backend API is reachable
- Verify `/api/rickroll` endpoint works
- Check backend logs for errors

### Docker Container Won't Start
```bash
# Check logs
docker logs portfolio-frontend

# Verify port isn't in use
lsof -i :8080

# Rebuild
docker build --no-cache -t portfolio-frontend .
```

## License
Portfolio project - Free to use

## Author
Sushrut

## Links
- [Backend Repository](../Portfolio-Backend)
- [Deployment Guide](../AWS_DEPLOYMENT_GUIDE.md)
- [Redis Setup Guide](../UPSTASH_REDIS_SETUP.md)
