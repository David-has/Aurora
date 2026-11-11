# Aurora Expeditions — Landing Page

A fully animated, responsive landing page for **Aurora Expeditions**, a fictional travel agency that runs small-group northern lights trips to Norway, Iceland and Finland. It showcases a live-animated sky, an interactive price calculator, scroll-driven motion, and a polished light/dark theme, all in plain HTML, CSS and JavaScript with no dependencies and no build step.

> The page copy is in Romanian (`lang="ro"`). Aurora Expeditions is a fictional brand and all prices, texts and reviews are placeholders created as a design example.

## Highlights

- **Animated aurora sky** drawn on a `<canvas>`: twinkling stars and three flowing aurora ribbons that react to the pointer. At night it blends additively on a dark sky; by day it switches to soft pastel ribbons on a dawn gradient.
- **Trip price calculator** with destination, nights, travelers and season controls. The total animates live and shows a breakdown with an automatic group discount.
- **Live aurora forecast gauge**: an animated semicircular Kp index that changes color and label with the simulated activity level.
- **Real countdown** to the next departure (18 December), rolling over to next year automatically.
- **Destination tabs** with an animated panel and CSS-generated landscape art.
- **Scroll-driven timeline** whose line fills as you scroll through "an evening of aurora hunting".
- **Testimonial slider** with autoplay, dot navigation and smooth transitions.
- **Three pricing plans** (Explorer, Aurora, Polar) with a highlighted featured plan.
- **Light and dark mode** that follows the system setting, with a manual toggle remembered across visits.
- **Rich motion**: letter-by-letter hero title, staggered reveals from different directions, animated counters, scroll progress bar, marquee strip, magnetic buttons, pointer-following glow and an animated gradient call to action.
- **Mobile-first details**: hamburger menu, fluid type, safe-area padding for notched phones, and touch-aware behavior (pointer effects only on devices with a mouse).
- **Accessible**: visible keyboard focus, ARIA roles and labels, live regions for the toast and form hint, and full `prefers-reduced-motion` support.

## Project structure

```
aurora/
├── index.html        # page markup and sections
├── css/
│   └── style.css     # design tokens, layout, themes, animations, responsive rules
└── js/
    └── main.js       # all behavior, split into small init functions
```

## Getting started

No installation is needed. Open `index.html` in a browser, or serve the folder locally:

```bash
npx serve .
```

### Deploy to GitHub Pages

1. Push the folder to a repository.
2. Go to **Settings → Pages**.
3. Choose **Deploy from a branch**, select `main` and the folder that contains `index.html`.

The site is completely static, so nothing else is required.

## Page sections

| Section | What it does |
|---|---|
| Hero | Animated sky, split-letter title, calls to action, countdown and live forecast card |
| Marquee | Endless strip of destination names |
| Destinations | Tabs for each country, plus animated statistics |
| Planner | Interactive price calculator |
| Plans | Three packages with prices and included features |
| Timeline | Scroll-filled story of a typical evening |
| Reviews | Auto-rotating testimonials |
| FAQ | Native expandable questions |
| Booking | Email form with validation and a confirmation toast |

## How it works

**Theme.** On first visit the theme follows `prefers-color-scheme`. The toggle writes the choice to `localStorage` under `aurora-theme`. All colors are CSS variables on `:root`, redefined for `[data-theme="dark"]`, and the canvas reads the current theme on every frame, so the sky restyles instantly.

**Sky.** Stars are generated once per resize, proportional to the screen width. Each aurora band is a filled wave built from two sine functions with its own hue, height, amplitude and speed, painted with a vertical gradient. The pointer position nudges the stars and lifts the ribbons slightly. When reduced motion is on, a single static frame is drawn.

**Calculator.** For each destination the price is:

```
stay      = nightlyRate × nights × travelers × seasonMultiplier
flights   = flightPrice × travelers
discount  = 8% of (stay + flights) when travelers ≥ 4
total     = stay + flights − discount
```

The season multiplier is `1.25` for peak season and `1` for off season. The total is eased from the previous value to the new one on every change.

**Forecast.** A random Kp value between 1.5 and 9 is generated every few seconds. The arc length, color and label are derived from it: weak, good, very good, or storm. It is a simulation, not real space-weather data.

**Reveal animations.** Elements marked `data-r` (`up`, `left`, `right`, `zoom`) and children of `data-rg` containers (staggered) are observed with `IntersectionObserver` and receive an `in` class when they enter the viewport. Numbers marked `data-count` count up at the same moment. The motion styles only apply once JavaScript adds a `motion` class, so the page stays fully visible without it.

**Timeline.** On scroll, the position of the timeline block is mapped to a CSS variable (`--fill`) that controls the height of the colored line.

## Customization

### Content

- **Destinations and prices** live in the `destinations` array at the top of `js/main.js`: name, description, gradient, quick facts, nightly rate and flight price.
- **Pricing cards** are written directly in `index.html`. They are independent from the calculator, so update both if you change prices.
- **Departure date**: change the month and day in `initCountdown` (currently 18 December at 18:00), and the matching text in `index.html`.
- **Reviews and FAQ** are plain HTML blocks in `index.html`.

### Look and feel

- Brand colors are `--green`, `--violet`, `--pink` and `--amber`, defined for both themes in `css/style.css`.
- Section backgrounds use `--ta` to `--te`, so each section keeps a clearly different tone.
- The hero background is `--hero`, and the aurora ribbons are configured in the `bands` array in `initSky` (hue, height, amplitude, speed).
- The typeface is Bricolage Grotesque from Google Fonts.

### Booking form

The form currently validates the email and shows a confirmation message, but it does not store anything. To collect real signups, send the value to a backend or a service of your choice inside the submit handler in `initBooking`.

## Responsive behavior

| Breakpoint | Changes |
|---|---|
| ≤ 960px | Hamburger menu, single-column layouts, 2-column statistics |
| ≤ 560px | Tighter padding, smaller marquee, taller slider, compact buttons |
| Touch devices | Pointer glow and magnetic buttons are disabled |

## Browser support

Current versions of Chrome, Edge, Firefox and Safari. The page uses `color-mix()`, `svh` units, CSS variables, `IntersectionObserver` and `backdrop-filter`.

## Performance notes

- The canvas runs a single `requestAnimationFrame` loop, uses a capped device pixel ratio and draws no images.
- Scroll handlers are throttled with `requestAnimationFrame` and registered as passive.
- There are no external libraries; the only network request is the Google Fonts stylesheet.

## License

Add the license of your choice (for example MIT) before publishing.
