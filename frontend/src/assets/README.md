# assets/

For imported, build-processed static files — a logo image, hero photography,
custom fonts, etc.

Right now every icon in this project (including the car glyph and the
favicon) is an inline SVG React component in `src/components/icons.jsx`
instead of an image file, because several of them need per-car dynamic
coloring (see the `tint` prop on `CarGlyph`) — plain `<img>` assets can't do
that. Drop real image files here as the site grows real photography, e.g.:

```
assets/
  logo.svg
  hero-photo.jpg
```

then `import logo from '../assets/logo.svg'` in whichever component needs it.
