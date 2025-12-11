# BDDM UI - Bibliographic Data Disambiguation and Management UI

A full-stack application for managing and disambiguating bibliographic author data with ORCID integration.

## Project Overview

BDDM UI is a web application designed to handle author disambiguation and bibliographic data management. It provides an intuitive interface for viewing author information, matching candidates, and managing publication records.

**Key Features:**
- Author profile management with ORCID integration
- Co-author network visualization
- Author matching and disambiguation
- Publication and affiliation tracking
- Diff-based comparison for data validation

## Tech Stack

### Backend
- **Framework:** Flask (Python)
- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **CORS:** Flask-CORS for cross-origin requests

### Frontend
- **Framework:** React 19
- **Visualization:** react-force-graph-2d (co-author network graphs)
- **HTTP Client:** Axios
- **Testing:** React Testing Library
- **Build Tool:** Create React App

## Project Structure

```
BDDM UI/
├── api/                          # Flask backend
│   ├── app.py                   # Main Flask application
│   ├── models.py                # SQLAlchemy ORM models
│   ├── .env                     # Environment variables (not in git)
│   └── __pycache__/
├── web/                          # React frontend
│   ├── public/                  # Static assets
│   │   └── index.html
│   ├── src/
│   │   ├── App.js              # Main React component
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── api.js              # API client configuration
│   │   ├── components/
│   │   │   ├── CoAuthorGraph.js    # Network visualization
│   │   │   ├── MatchCard.js        # Individual match display
│   │   │   ├── MatchList.js        # Match list container
│   │   │   └── DiffLabel.js        # Diff comparison display
│   │   └── pages/
│   │       └── Dashboard.js    # Main dashboard page
│   ├── package.json
│   └── .gitignore
├── database schema.sql           # PostgreSQL schema
├── .gitignore
└── README.md
```

## Database Schema

The application uses a PostgreSQL database with the following main entities:

- **Author** - Author information with ORCID IDs
- **Publication** - Bibliographic publication records
- **MasterAuthor** - Deduplicated author records
- **MasterAuthorEntry** - Historical tracking of master author versions
- **AuthorAlias** - Alternative names for authors
- **MatchCandidate** - Potential author matches for disambiguation

See `database schema.sql` for complete schema details.

## Installation & Setup

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd api
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   Create `.env` file in the `api/` directory:
   ```env
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=your_db_host
   DB_PORT=5432
   DB_NAME=your_db_name
   FLASK_ENV=development
   ```

3. **Run the Flask server:**
   ```bash
   cd api
   python app.py
   ```
   The API will be available at `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd web
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```
   The frontend will open at `http://localhost:3000`

## API Endpoints

The Flask backend provides RESTful endpoints for:
- Author queries and management
- Publication data retrieval
- Match candidate operations
- Master author disambiguation

See `api/app.py` for complete endpoint documentation.

## Key Components

### Frontend Components

- **Dashboard** - Main page displaying author data and matches
- **CoAuthorGraph** - Visualizes co-author relationships using force-directed graph
- **MatchList** - Displays list of potential author matches
- **MatchCard** - Individual match card with details and diff comparison
- **DiffLabel** - Shows differences between candidate authors using diff-match-patch

### Backend Models

- **Author** - Individual author records with ORCID and affiliation data
- **Publication** - Publication records linked to authors
- **MasterAuthor** - Canonical deduplicated author records
- **MatchCandidate** - Potential matches for author disambiguation

## Development

### Running Tests

**Frontend:**
```bash
cd web
npm test
```

**Backend:**
```bash
cd api
pytest
```

### Environment Variables

The application requires the following environment variables in `api/.env`:
- `DB_USER` - PostgreSQL username
- `DB_PASSWORD` - PostgreSQL password
- `DB_HOST` - PostgreSQL host address
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_NAME` - PostgreSQL database name
- `FLASK_ENV` - Flask environment (development/production)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a pull request

## License

See LICENSE file for details.

## Contact & Support

For questions or issues, please refer to the project repository or contact the development team.
