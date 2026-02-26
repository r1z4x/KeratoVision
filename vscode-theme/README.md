# KeratoVision — Eye Comfort Theme

**Reduced-contrast, eye-comfort-first color themes for VS Code, Cursor, and Antigravity.**

Designed for developers with **keratoconus**, **astigmatism**, or anyone who wants a gentler coding experience.

## Variants

| Theme | Mode | Description |
|-------|------|-------------|
| **KeratoVision Dark** | Dark | Default — reduced contrast, soft muted palette |
| **KeratoVision Soft** | Dark | Maximum comfort — warmer, lower saturation |
| **KeratoVision Light** | Light | Warm cream background, earthy tones |

## Design Principles

- **No pure black/white** — all backgrounds and text are softened
- **Low-saturation syntax** — muted purples, teals, soft greens
- **No bright reds** — replaced with warm coral tones
- **Comfortable brackets** — subtle, not distracting
- **Clear line numbers** — easy line tracking
- **Full semantic highlighting** — TypeScript, Python, Rust, CSS, HTML, Markdown, JSON, YAML

## Color Palette

### Dark/Soft
```
Background:  #12121a / #181825
Foreground:  #d8d8e8 / #cdd6f4
Accent:      #6C63FF (purple) / #48CFCB (teal)
```

### Light
```
Background:  #f5f3ee (warm cream)
Foreground:  #2a2a3c (soft dark)
```

## Install

```bash
# Package as .vsix
cd vscode-theme
npx @vscode/vsce package

# Install
code --install-extension keratovision-theme-1.0.0.vsix
```

## License

MIT
