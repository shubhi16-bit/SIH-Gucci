============================================================
NWIS - HOW TO ATTACH YOUR MP4 VIDEO TO THE LANDING PAGE
============================================================

Your landing page is already configured to display an MP4 video right in the Hero section (on the right side of the text).

To attach your real MP4 video:
1. Place your video file inside this "public" folder:
   /Users/shivanshiagarwal/Documents/vscode for SIH/public/drilling-demo.mp4

2. Name the file:
   drilling-demo.mp4

3. That's it! 
   The video player in "src/components/VideoPlayer.jsx" is already set to load "/drilling-demo.mp4".
   When your file is present, it will automatically play with sound toggle, fullscreen, and smooth controls!

4. If you have a different filename (e.g., "my_sih_video.mp4"):
   Simply open "src/components/VideoPlayer.jsx" and change:
   const videoSrc = "/drilling-demo.mp4";
   to:
   const videoSrc = "/my_sih_video.mp4";

5. When no MP4 file is found yet, the system shows an animated high-tech drilling telemetry radar & trajectory preview so your site looks 100% complete and polished at all times.
============================================================
