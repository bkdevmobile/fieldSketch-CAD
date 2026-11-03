# outlineGo — English YouTube Shorts

**Publication update — 3 November 2026:** the user confirmed that S01, “Aim. Walk. Sketch. Phone sensors in action | outlineGo” (54 s), has been published on YouTube. Publication URL not provided. S02–S04 remain without publication confirmation. Earlier statements below that all four Shorts are unpublished are historical for S01.

Prepared **1 November 2026** from the existing V04/V05/V06 source recordings. Four new vertical edits; **not uploaded**. The separately recorded YouTube Shorts publication from 31 October is an earlier material.

[Open all four previews](output/preview.html) · [Titles, descriptions and tags](output/METADATA.md) · [Metadata JSON](output/metadata.json) · [Verification report](output/verification.json)

| Short | Duration | Upload MP4 | Based on |
| --- | --- | --- | --- |
| S01 — Aim. Walk. Sketch. | 54 s | [Camera and steps](output/s01-camera-and-steps-en.mp4) | V06 |
| S02 — 8 steps to an estimated length | 30 s | [Steps to length](output/s02-steps-to-length-en.mp4) | V06 |
| S03 — A 5 × 4 m room sketch | 42 s | [Room sketch](output/s03-room-sketch-en.mp4) | V05 |
| S04 — Phone sketch to DXF and CAD | 44 s | [Sketch to CAD](output/s04-sketch-to-cad-en.mp4) | V04 |

## Format and editing

1080 × 1920 / 9:16, 30 fps, MP4 H.264, AAC stereo 48 kHz. Native portrait recordings are recomposed in a vertical layout rather than cropping the wide tutorials. Full app controls remain visible; essential instructions appear above the app, with no duplicated subtitle track or production captions. The right and bottom margins leave room around the content, but YouTube controls vary by device.

All source footage runs at its original speed. Each scene has at least four seconds of reading time. Cuts omit intermediate actions and do not imply one continuous physical measurement. S01 jumps from saving a side to the completed example. S03 includes the existing room illustration with a gentle centred zoom out and no lateral movement. No new AI image was generated.

S04 uses only the approved CAD drawing viewport, a tighter drawing crop inside it, the units dialog crop and the numeric length status. The private file-selection recording is excluded. No emulator, app source or APK was modified for this work.

## Provenance and disclosure

- **S01/S02:** actual app interface with simulated direction and step readings from V06; a generated garden image supplies the virtual camera. These do not demonstrate physical measurement or sensor accuracy. Eight simulated steps at 75 cm produce the example estimate of 6 m. The completed S01 outline is 6 × 4.5 m, with 21 m perimeter and 27 m² area; closure is calculated.
- **S03:** generated illustration of a fictional person measuring a room. Actual UI with manually entered directions and lengths. The correction changes 4.8 m to 5 m; the 5 × 4 m result has an 18 m perimeter and 20 m² area. The closing side is calculated. The original Free PNG is unchanged.
- **S04:** actual DXF export and LibreCAD captures of a 4 × 3 m rectangle, with a 14 m perimeter. The source recording used an authorised temporary test Plus entitlement, restored after the original recording. This is not a purchase demonstration. DXF export requires Plus; LibreCAD is separate software.

Keep these disclosures in the YouTube descriptions. S01/S02/S03 metadata also flags the generated scene for review of YouTube's altered/generated-content upload setting. Source details: [V06](../../www/video-v06/README.md), [V05](../../www/video-v05/README.md), [V04](../../www/video-v04/README.md).

## Music

Four different existing tracks, all Kevin MacLeod (incompetech.com), CC BY 4.0:

- S01: Montauk Point.
- S02: Carefree, using the original source MP3 retained in `googlePlay/promo-en/audio/`.
- S03: Dream Culture.
- S04: Life of Riley.

Each description and MP4 comment contains the author, track, licence URL, source URL and changes. Music uses a short excerpt, quiet normalisation, 1.5 s fade-in and 3 s fade-out. Preserve the full credits when uploading. Silent versions are retained as an alternative.

## Files and upload preparation

Each short has a final MP4, silent MP4, cover PNG/WebP, description TXT, metadata JSON, edit manifest and contact sheet in `output/`. `METADATA.md` contains all four copy-ready English titles, descriptions, hashtags and tags. The video filenames contain internal S01–S04 labels; the public titles do not.

Descriptions link to the active Firebase website and Google Play. Replace the website URL only after the ordered `outlinego.com` is active and connected. No unconfirmed mapping to existing YouTube videos is assumed.

Upload the four MP4 files without `-silent` unless you prefer the sound-free versions. Do not remove the simulation/illustration disclosure or music credits from their descriptions. These are portrait, under-one-minute files; current Shorts format guidance is documented by [YouTube](https://support.google.com/youtube/answer/15424877?hl=en).

## Reproduction and verification

```powershell
node media/youtube/shorts-en/render.cjs
node media/youtube/shorts-en/verify.cjs
```

Requires the existing `app/node_modules/sharp` and `C:/ffmpeg/ffmpeg.exe` (override with `SHORTS_FFMPEG`). Temporary render files are ignored by Git. Full render rebuilds the gallery and aggregate metadata.

Verification passed for all four: 1620 / 900 / 1260 / 1320 decoded frames, correct dimensions/durations, AAC stereo, no subtitle track, video packets identical to silent counterparts, source SHA-256, original-speed cuts, readable holds, approved privacy crops, disclosure in MP4/description, existing preview assets, metadata lengths and quiet music (-23.2 / -24.2 / -25.3 / -24.0 LUFS). Contact sheets were visually inspected. No upload or WWW change was performed.
