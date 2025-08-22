# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension called "Salah Clock" that displays Islamic prayer times and provides a new tab replacement page with prayer time information and countdown timers.

## Architecture

### Core Components

- **manifest.json**: Chrome extension manifest (v3) that defines the extension configuration
- **newtab.html**: Main new tab replacement page with prayer times display and timer
- **popup.html**: Basic popup interface (minimal functionality)

### JavaScript Structure

- **scripts/prayertime.js**: Contains PrayTimes library (v2.3) for calculating Islamic prayer times based on geographic coordinates and calculation methods
- **scripts/content.js**: Main logic for prayer time calculations, DOM manipulation, and top sites integration
- **scripts/timer.js**: Timer class that handles countdown functionality with circular progress indicator
- **scripts/popup.js**: Minimal popup functionality

### Key Features

- **Prayer Time Calculation**: Uses PrayTimes.js library with ISNA method, hardcoded for Dhaka coordinates (23.8103, 90.4125)
- **Timer System**: Circular progress timer showing time remaining until next prayer
- **Top Sites Integration**: Displays Chrome's top visited sites as shortcuts
- **New Tab Override**: Replaces Chrome's new tab page with prayer times interface

### Data Flow

1. `content.js` initializes PrayTimes library and calculates prayer times
2. Prayer times are stored in `prayerTimeHashMap` global variable
3. Timer system uses `getRemainingTime()` and `getTotalTimePerPrayer()` functions
4. Timer class creates visual countdown with SVG circular progress indicator
5. Global variables and functions are exposed via `window` object for inter-script communication

### Prayer Time Functions

- `getCurrentPrayer()`: Determines which prayer period is currently active
- `getRemainingTime()`: Calculates time until next prayer
- `getTotalTimePerPrayer()`: Gets total duration between current and next prayer
- All times converted to minutes since midnight for calculations

## Development Notes

This extension has no build process - it uses vanilla HTML/CSS/JS that can be loaded directly in Chrome as an unpacked extension. No package.json, build tools, or testing framework is present.

The PrayTimes calculation method and coordinates are hardcoded and would need modification for different locations or calculation preferences.