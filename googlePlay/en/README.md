# outlineGo English Google Play graphics

English versions of the two selected Polish graphics, generated with the built-in image_gen tool. Headings, captions and text within the sketch panels have been translated. The English headlines are **From field to CAD** and **Plan your space**.

| Folder | Contents | Dimensions |
| --- | --- | --- |
| `screenshots/phone/` | 2 portrait graphics | 1080 × 1920 |
| `screenshots/tablet-7/` | 2 portrait graphics | 1080 × 1920 |
| `screenshots/tablet-10/` | 2 portrait graphics | 1080 × 1920 |
| `screenshots/landscape/` | 2 additional landscape graphics | 1920 × 1080 |
| `feature-graphic/` | 2 alternative feature graphics, choose one | 1024 × 500 |

All exported images are opaque 24-bit RGB PNGs under 8 MB. Portrait screenshots are 9:16 and landscape screenshots are 16:9. Validation results are in `validation.json`. The existing language-neutral icon is in `../icon/`.

Original English generated images are retained in `sources/`. Full localization prompts are in `prompts.json`. Run `node googlePlay/en/export-assets.cjs` from the project root to reproduce the technical exports.

These retain the selected concept artwork: the app and CAD panels are generated illustrations, not pixel-identical screenshots captured on the listed devices. The CAD graphic retains its concept illustration caption. Polish originals are unchanged.
