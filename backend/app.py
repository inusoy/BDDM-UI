import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from urllib.parse import quote_plus
from models import db, MatchCandidate, Author, Publication, MasterAuthor, MasterAuthorEntry

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Connection
db_user = os.getenv('DB_USER')
db_password = os.getenv('DB_PASSWORD')
db_host = os.getenv('DB_HOST')
db_port = os.getenv('DB_PORT')
db_name = os.getenv('DB_NAME')

encoded_password = quote_plus(db_password) if db_password else ""
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{encoded_password}@{db_host}:{db_port}/{db_name}?client_encoding=utf8'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# --- Helper Function ---
def serialize_author(auth):
    if not auth:
        return None
    
    pubs = []
    for p in auth.publications[:5]: # Limit to 5 for display
        pubs.append({
            'title': p.title,
            'year': p.publication_year,
            'venue': p.venue_name
        })
        
    return {
        'id': auth.id,
        'orcid': auth.orcid_id,
        'name': f"{auth.given_name} {auth.family_name}",
        'given_name': auth.given_name,
        'family_name': auth.family_name,
        'affiliation': auth.raw_affiliation_string,
        'master_id': auth.master_author_id,
        'publications': pubs
    }

# --- Routes ---

@app.route('/api/matches/pending', methods=['GET'])
def get_pending_matches():
    # Fetch pending matches joining with Author details for preview
    matches = MatchCandidate.query.filter_by(status='pending')\
        .join(Author, MatchCandidate.author_id_a == Author.id)\
        .order_by(MatchCandidate.total_score.desc()).limit(50).all()
        
    results = []
    for m in matches:
        results.append({
            'author_id_a': m.author_id_a,
            'author_id_b': m.author_id_b,
            'name_a': f"{m.author_a.given_name} {m.author_a.family_name}",
            'name_b': f"{m.author_b.given_name} {m.author_b.family_name}",
            'score': m.total_score
        })
    return jsonify(results)

@app.route('/api/match/<int:id_a>/<int:id_b>', methods=['GET'])
def get_match_details(id_a, id_b):
    match = MatchCandidate.query.get_or_404((id_a, id_b))
    
    response_data = {
        'scores': {
            'total': match.total_score,
            'name_sim': match.name_score,
            'coauthor': match.coauthor_boost
        },
        'author_a': serialize_author(match.author_a),
        'author_b': serialize_author(match.author_b)
    }
    return jsonify(response_data)

@app.route('/api/match/<int:id_a>/<int:id_b>/decide', methods=['POST'])
def decide_match(id_a, id_b):
    data = request.json
    decision = data.get('decision')
    
    match = MatchCandidate.query.get_or_404((id_a, id_b))
    
    if decision == 'approve':
        match.status = 'approved'
        
        auth_a = match.author_a
        auth_b = match.author_b
        
        # --- Merge Logic ---
        # 1. Determine Master Record
        master = None
        
        # Check if either already has a master
        if auth_a.master_author_id:
            master = MasterAuthor.query.get(auth_a.master_author_id)
        elif auth_b.master_author_id:
            master = MasterAuthor.query.get(auth_b.master_author_id)
            
        # If no master exists for either, create one (using Author A as base)
        if not master:
            master = MasterAuthor(
                primary_orcid=auth_a.orcid_id,
                canonical_name=f"{auth_a.given_name} {auth_a.family_name}"
            )
            db.session.add(master)
            db.session.flush()
            
        # 2. Link both authors to this Master
        auth_a.master_author_id = master.id
        auth_b.master_author_id = master.id
        auth_a.processing_status = 'processed'
        auth_b.processing_status = 'processed'
        
        # 3. Create Audit Entries (Snapshots)
        for auth in [auth_a, auth_b]:
            entry = MasterAuthorEntry(
                master_author_id=master.id,
                original_candidate_id=auth.id, # Snapshotting this specific test_author record
                raw_orcid=auth.orcid_id,
                raw_name=f"{auth.given_name} {auth.family_name}",
                raw_affiliation=auth.raw_affiliation_string
            )
            db.session.add(entry)

    elif decision == 'reject':
        match.status = 'rejected'
        # Optional: Mark them as processed so they don't show up in other logic? 
        # For now, just marking the match as rejected is enough.
    
    else:
        return jsonify({'error': 'Invalid decision'}), 400
    
    db.session.commit()
    return jsonify({'success': True, 'status': match.status})

if __name__ == '__main__':
    app.run(debug=True, port=5000)