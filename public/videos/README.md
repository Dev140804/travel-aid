# 🎬 Adding Travel Videos to Your App

The animated background component is configured to load videos from your `/public/videos/` directory. If local videos aren't found, it automatically falls back to free online videos.

## How to Add Your Own Videos

### Option 1: Quick Start (Using Fallback Videos)
No action needed! The app will automatically use free placeholder videos from W3Schools while you develop.

### Option 2: Add Local Videos (Recommended for Production)

Download free 4K travel videos from these sources and add them to `/public/videos/`:

#### 📥 Recommended Free Video Sources:
- **Pixabay Videos** (https://pixabay.com/videos/)
- **Pexels Videos** (https://pexels.com/videos/)
- **Mixkit** (https://mixkit.co/free-stock-video/)

#### 📁 Expected File Structure:
```
public/
├── videos/
│   ├── cruise.mp4
│   ├── mountain.mp4
│   ├── beach.mp4
│   ├── city.mp4
│   ├── desert.mp4
│   └── forest.mp4
```

#### ⚙️ Setup Commands:
```bash
# Create videos directory if it doesn't exist
mkdir -p public/videos

# Download example videos (Mac/Linux):
# You can use `curl` or browser download
cd public/videos

# Download from Pexels Videos
# Open https://pexels.com/videos/ and click download on these scenes:
# - Cruise Ship
# - Mountain/Alpine
# - Beach
# - City/Urban
# - Desert/Sunset
# - Forest/Nature

# Then save them with the names above
```

#### Or use a script to download:
```bash
#!/bin/bash
# public/videos/download.sh

# These are example video URLs you can replace with your preferred sources
echo "Downloading travel videos..."

# Note: Direct download URLs from free services
# You may need to manually download and rename files from the websites above

cd "$(dirname "$0")"
echo "Videos directory ready at: $(pwd)"
echo "Please add your MP4 files here"
```

## 🔄 Fallback System

The component uses a smart fallback system:
1. **First** - Tries to load local videos from `/public/videos/`
2. **Second** - Falls back to free online videos from W3Schools
3. **Last** - Shows beautiful animated gradient background

## 📝 Component Configuration

Edit `components/AnimatedHeroBackground.tsx` to change:
- Video URLs
- Scene names and descriptions
- Transition timing (currently 8 seconds)
- Quality badges

```typescript
const travelScenes = [
  {
    id: "cruise",
    name: "Cruise Ship",
    videoUrl: "/videos/cruise.mp4", // Local path
    fallbackUrl: "https://...", // Online fallback
    quality: "4K",
  },
  // ... more scenes
];
```

## 🎯 Tips & Best Practices

### File Sizes
- Keep videos under 20MB for fast loading
- Use 1920x1080 resolution minimum
- MP4 format with H.264 codec recommended

### Video Duration
- Keep each video between 5-15 seconds
- Component auto-rotates every 8 seconds

### Browser Support
- Modern browsers (Chrome, Safari, Firefox, Edge)
- Mobile-friendly with auto-play muted

### Performance
- Videos load in background with minimal impact
- Preload="auto" for smooth transitions
- CORS-friendly hosting recommended

## 🐛 Troubleshooting

### Videos not playing?
1. Check that files exist in `/public/videos/`
2. Use `.mp4` format
3. Check browser console for error messages
4. Verify video codec compatibility

### Fallback GIF showing?
- Local video files not found (expected behavior)
- Add video files to `/public/videos/` as shown above

### Memory issues?
- Reduce video file size
- Use simpler/shorter videos
- Clear browser cache

## 📚 Resources

- [Next.js Public Folder](https://nextjs.org/docs/app/building-your-application/optimizing/static-assets)
- [HTML5 Video Format Guide](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
- [Web Video Codec Support](https://caniuse.com/video)

---

Ready to add videos? Check the component browser console for detailed loading information! 🚀
