# Oldman River Dashboard

Interactive environmental and fish distribution dashboard for the Oldman River project.

## Setup

### 1. Clone the repository

git clone <repository-url>
cd oldman-river-dashboard

### 2. Install dependencies

The `node_modules` folder is not included in the repository.

Run:

npm install

This will install all required dependencies from `package.json`.

### 3. Run the dashboard

Start a local development server:

npx http-server .

Then open the URL shown in the terminal, usually:

http://localhost:8080

## Project Structure

```
oldman-river-dashboard/
├── index.html                  # Page shell: loads styles and scripts in order
├── assets/
│   ├── css/
│   │   ├── main.css            # Entry point; @import order = cascade order
│   │   ├── base/               # Reset, page, map canvas, responsive overrides
│   │   ├── layout/             # Sidebar and legend panels
│   │   ├── components/         # Cards, forms, buttons, searchable select, sources
│   │   ├── features/           # Fish timeline, fish stats, ML results
│   │   └── map/                # Map controls and popups
│   └── js/
│       ├── config/             # Constants, layer definitions, map style, option lists
│       ├── utils/              # Small helpers (dates, HTML, CSV)
│       ├── components/         # Reusable UI components that build the page markup
│       │   ├── ui.js           # Card, SelectField, ActionButton, StatTile, ...
│       │   ├── sidebar/        # One file per sidebar card
│       │   └── map/            # Map container and legend panel
│       ├── core/               # Renders the page, shared state, DOM refs, map instance
│       ├── features/           # River, environment, fish and ML layer logic
│       ├── ui/                 # Legend, summary counters, panel toggles
│       └── main.js             # Entry point: wires events and starts the map
├── data/                       # Dashboard datasets and map files
├── package.json
├── .gitignore
└── README.md
```

### How the scripts fit together

The scripts are plain (non-module) files that share one global scope, so no
build step is needed. Their order in `index.html` matters:

1. `config/` and `utils/` define constants and helpers.
2. `components/` define the UI components; `core/render-app.js` renders them.
3. `core/state.js`, `core/dom.js` and `core/map.js` set up state, element
   references and the map.
4. `features/` and `ui/` only define functions.
5. `main.js` runs last and connects everything.

To add a new sidebar card, create it in `assets/js/components/sidebar/`,
add it to `Sidebar()` in `sidebar.js`, and add its `<script>` tag before
`components/app-shell.js` in `index.html`.

## Important

Do not commit the `node_modules` folder to GitHub.

After cloning the repository on a new computer, always run:

npm install

before starting the dashboard.