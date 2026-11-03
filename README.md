# Taco Rush — Salsa Bar

A mobile-first, English-language taco kitchen game. Match each guest's tortilla, filling, salsa, and toppings before the 90-second lunch rush ends. The Android project wraps the same game in a native WebView shell.

## Play

Open `index.html` in a modern browser, or install the APK built by GitHub Actions. The game works with touch, mouse, and keyboard-accessible buttons.

## Scoring

- Correct order: +100 points.
- Fast-service tip: +50 points when the order is served before its customer threshold.
- Missed ticket: −25 points (once per ticket).
- Complete all five orders: +200 points.

## Build

The local HTML build requires Node.js 22 or newer; no package installation is needed. GitHub Actions also builds a debug APK using Android SDK and Gradle on its hosted runner.

```sh
node tools/build.mjs
```

The GitHub Actions workflow runs the HTML build and gameplay smoke check, builds `android/app/build/outputs/apk/debug/app-debug.apk`, and uploads both the web game and APK as workflow artifacts.
