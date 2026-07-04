# Receipt Expense Tracker — Design Spec

## Overview

A minimal, single-file web app for tracking expenses with optional photo receipts. Runs entirely in the browser with no server, no build step, and no dependencies to install. Designed for Android phones via Chrome.

## Architecture

**Single HTML file** containing all HTML, CSS, and JavaScript. Zero external dependencies except one CDN-loaded library (jsPDF) for PDF export.

## Features

### 1. Add Entry
- Input field for **amount** (number)
- Input field for **description** (text)
- **Camera/gallery button** — captures or selects an image
- Image preview before saving
- **Save button** — stores the entry

### 2. View Entries
- **List of all entries** displayed as cards
- Each card shows: amount, description, date
- Tap a card to expand and view full details including the photo
- **Delete button** on each entry

### 3. Running Total
- Header displays the **sum of all entries**
- Updates in real-time when entries are added or deleted
- Configurable currency symbol

### 4. Export to PDF
- Button to **export all records as PDF**
- Each entry gets its own page with details and thumbnail
- Uses jsPDF library (loaded from CDN)

## Data Storage

**IndexedDB** — the browser's built-in database API.

Each record schema:
```
{
  id:          number (auto-incremented)
  amount:      float
  description: string
  image:       string (Base64-encoded, or null if no image)
  timestamp:   ISO date string
}
```

## UI/UX

- **Mobile-first, minimal design**
- Large touch targets for easy tapping
- Clean form → list flow
- Neutral color scheme
- No frameworks or libraries beyond jsPDF

## Technical Details

| Aspect          | Choice                          |
|-----------------|---------------------------------|
| Language        | Vanilla JavaScript (ES6+)       |
| Styling         | Inline CSS                      |
| Storage         | IndexedDB                       |
| PDF generation  | jsPDF (CDN)                     |
| Images          | Base64 encoded in IndexedDB     |
| Camera access   | `<input type="file" accept="image/*" capture="environment">` |
| Offline         | Yes — everything runs locally    |

## File Structure

```
SimpleExpense/
├── index.html          (all-in-one: HTML + CSS + JS)
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-07-04-receipt-tracker-design.md
```

## Success Criteria

1. Open `index.html` in Chrome on Android → app works immediately
2. Add entries with or without photos
3. See running total update in real-time
4. Export all entries to a single PDF file
5. Data persists after closing the browser
6. No internet connection required (after initial load)
