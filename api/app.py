import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from urllib.parse import quote_plus
from models import db, MatchCandidate, Author, Publication, MasterAuthor, MasterAuthorEntry
from sqlalchemy import text

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
    
    # --- NEW: Fetch Shared Co-Authors ---
    # This query finds authors who appeared on papers with BOTH A and B
    sql = text("""
        SELECT DISTINCT a.given_name, a.family_name
        FROM test_authorship t1
        JOIN test_authorship t2 ON t1.author_id = t2.author_id
        JOIN test_author a ON t1.author_id = a.id
        WHERE t1.publication_id IN (SELECT publication_id FROM test_authorship WHERE author_id = :id_a)
          AND t2.publication_id IN (SELECT publication_id FROM test_authorship WHERE author_id = :id_b)
          AND t1.author_id NOT IN (:id_a, :id_b)
        LIMIT 10
    """)
    
    result = db.session.execute(sql, {'id_a': id_a, 'id_b': id_b}).fetchall()
    shared_coauthors = [f"{row[0]} {row[1]}" for row in result]

    response_data = {
        'scores': {
            'total': match.total_score,
            'name_sim': match.name_score,
            'coauthor': match.coauthor_boost
        },
        'author_a': serialize_author(match.author_a),
        'author_b': serialize_author(match.author_b),
        'shared_coauthors': shared_coauthors  # <--- Sending this to UI
    }
    return jsonify(response_data)

@app.route('/api/match/<int:id_a>/<int:id_b>/decide', methods=['POST'])
def decide_match(id_a, id_b):
    data = request.json
    decision = data.get('decision')
    custom_name = data.get('custom_name') # <--- New parameter
    
    match = MatchCandidate.query.get_or_404((id_a, id_b))
    
    if decision == 'approve':
        match.status = 'approved'
        auth_a = match.author_a
        auth_b = match.author_b
        
        # Merge Logic
        master = None
        if auth_a.master_author_id:
            master = MasterAuthor.query.get(auth_a.master_author_id)
        elif auth_b.master_author_id:
            master = MasterAuthor.query.get(auth_b.master_author_id)
            
        if not master:
            # USE THE CUSTOM NAME IF PROVIDED, ELSE FALLBACK TO AUTHOR A
            final_name = custom_name if custom_name else f"{auth_a.given_name} {auth_a.family_name}"
            
            master = MasterAuthor(
                primary_orcid=auth_a.orcid_id,
                canonical_name=final_name 
            )
            db.session.add(master)
            db.session.flush()

        auth_a.master_author_id = master.id
        auth_b.master_author_id = master.id
        auth_a.processing_status = 'processed'
        auth_b.processing_status = 'processed'

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