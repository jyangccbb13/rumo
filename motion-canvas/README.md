# RUMO Motion Canvas Animations

Professional text animations for the rumo hackathon demo video using Motion Canvas.

## Features

- **Smooth text animations** with fade-in/fade-out and scale effects
- **Brand-matched styling** using Geist Sans font and rumo's color palette (#E28B2F orange, #F5F5F5 background)
- **5 pre-built scenes**:
  1. **Intro** - RUMO brand title with orange accent
  2. **Onboarding** - Progress bar animation through 3 steps
  3. **Timeline** - Horizontal scrollable timeline with colored task nodes
  4. **Explore** - School cards with acceptance rate stats
  5. **Outro** - Closing credits with tagline

## Setup

```bash
cd motion-canvas
npm install
```

## Usage

### Development Mode
Run the Motion Canvas editor to preview and edit animations:

```bash
npm run serve
```

This will open the Motion Canvas editor at `http://localhost:9000` where you can:
- Preview animations in real-time
- Scrub through the timeline
- Edit scene durations
- Export individual scenes or the full video

### Build for Production
Render all scenes to video files:

```bash
npm run build
```

Exported videos will be in `motion-canvas/output/` folder.

## Customization

### Editing Scenes

Each scene is in `src/scenes/`:
- `intro.tsx` - Adjust brand title timing (currently 1.8s fade-in + 2s hold)
- `onboarding.tsx` - Modify progress bar steps and durations
- `timeline.tsx` - Add/remove task nodes, change colors
- `explore.tsx` - Update school cards and stats
- `outro.tsx` - Edit closing message

### Reusable Components

`src/components/` contains shared animation utilities:
- `AnimatedText.tsx` - Smooth text fade/scale animations
- `BrandTitle.tsx` - RUMO logo with orange accent

### Colors

Current color scheme matches rumo's design:
- Primary: `#E28B2F` (orange)
- Background: `#F5F5F5` (light gray)
- Text: `#1F1F1F` (dark gray)
- Muted: `#6B7280` (medium gray)

Edit colors in scene files to match your needs.

## Export Settings

Default export settings in Motion Canvas:
- **Resolution**: 1920x1080 (Full HD)
- **Frame rate**: 60 FPS
- **Format**: MP4 (H.264)

To change, modify the Motion Canvas editor settings or add `exporter` config in `src/project.ts`.

## Tips for Demo Video

1. **Keep scenes short** - Each scene is 4-6 seconds for quick pacing
2. **Match timing to voiceover** - Adjust `waitFor()` durations to sync with narration
3. **Export scenes separately** - Easier to edit in video editing software
4. **Add screenshots** - Overlay actual app screenshots on top of animations in post-production

## Troubleshooting

**Issue**: Motion Canvas editor won't start
- Make sure you're in the `motion-canvas` directory
- Run `npm install` again
- Check Node.js version (requires v18+)

**Issue**: Fonts don't match
- Geist Sans is loaded from Google Fonts in the browser
- For offline use, download Geist Sans and update font paths

**Issue**: Colors look different
- Check your display color profile
- Motion Canvas uses sRGB color space
- Export and verify in your video editor

## Resources

- [Motion Canvas Docs](https://motioncanvas.io/docs/)
- [Motion Canvas GitHub](https://github.com/motion-canvas/motion-canvas)
- [rumo GitHub](https://github.com/jyangccbb13/rumo)
