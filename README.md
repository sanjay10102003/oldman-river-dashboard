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

oldman-river-dashboard/
├── data/           # Dashboard datasets and map files
├── index.html      # Main dashboard application
├── package.json    # Node.js dependencies
├── .gitignore      # Files excluded from Git
└── README.md       # Project documentation

## Important

Do not commit the `node_modules` folder to GitHub.

After cloning the repository on a new computer, always run:

npm install

before starting the dashboard.