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
    for p in auth.publications[:5]: 
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
    limit = int(request.args.get('limit', 50))
    offset = int(request.args.get('offset', 0))

    query = MatchCandidate.query.filter_by(status='pending')\
        .join(Author, MatchCandidate.author_id_a == Author.id)\
        .order_by(MatchCandidate.total_score.desc())

    matches = query.limit(limit).offset(offset).all()
        
    results = []
    for m in matches:
        # Quick count for the list view badge
        count_sql = text("""
            SELECT COUNT(DISTINCT t1.author_id)
            FROM test_authorship t1
            JOIN test_authorship t2 ON t1.author_id = t2.author_id
            WHERE t1.publication_id IN (SELECT publication_id FROM test_authorship WHERE author_id = :id_a)
              AND t2.publication_id IN (SELECT publication_id FROM test_authorship WHERE author_id = :id_b)
              AND t1.author_id NOT IN (:id_a, :id_b)
        """)
        shared_count = db.session.execute(count_sql, {
            'id_a': m.author_id_a, 
            'id_b': m.author_id_b
        }).scalar() or 0
        
        results.append({
            'author_id_a': m.author_id_a,
            'author_id_b': m.author_id_b,
            'name_a': f"{m.author_a.given_name} {m.author_a.family_name}",
            'name_b': f"{m.author_b.given_name} {m.author_b.family_name}",
            'score': m.total_score,
            'coauthor_score': m.coauthor_boost,
            'shared_coauthor_count': shared_count
        })
    return jsonify(results)

@app.route('/api/match/<int:id_a>/<int:id_b>', methods=['GET'])
def get_match_details(id_a, id_b):
    match = MatchCandidate.query.get_or_404((id_a, id_b))
    
    # --- RECURSIVE GRAPH QUERY (Depth 6) ---
    # Finds chains like A -> B -> C -> D (needed for Scenario D)
    sql_graph = text("""
        WITH RECURSIVE path_search(last_author_id, path_ids, depth) AS (
            SELECT id, ARRAY[id], 0
            FROM test_author WHERE id = :id_a
            UNION ALL
            SELECT 
                t_next.author_id, 
                p.path_ids || t_next.author_id, 
                p.depth + 1
            FROM path_search p
            JOIN test_authorship t_curr ON p.last_author_id = t_curr.author_id
            JOIN test_authorship t_next ON t_curr.publication_id = t_next.publication_id
            WHERE p.depth < 6  -- Deep search for long chains
              AND t_next.author_id != ALL(p.path_ids)
        )
        SELECT DISTINCT path_ids, array_length(path_ids, 1) as path_len 
        FROM path_search 
        WHERE last_author_id = :id_b
        ORDER BY path_len ASC
        LIMIT 5;
    """)
    
    raw_paths = db.session.execute(sql_graph, {'id_a': id_a, 'id_b': id_b}).fetchall()
    
    # Process into Nodes & Links
    nodes_map = {}
    links_list = []
    existing_links = set()

    # Always include A and B
    nodes_map[id_a] = { 
        'id': 'A', 'real_id': id_a, 
        'name': f"{match.author_a.given_name} {match.author_a.family_name}", 
        'group': 'main' 
    }
    nodes_map[id_b] = { 
        'id': 'B', 'real_id': id_b, 
        'name': f"{match.author_b.given_name} {match.author_b.family_name}", 
        'group': 'main' 
    }

    all_ids = set()
    for row in raw_paths:
        path = row[0]
        for pid in path: all_ids.add(pid)
        
        # Build Links along the path
        for i in range(len(path) - 1):
            src, tgt = path[i], path[i+1]
            v_src = 'A' if src == id_a else ('B' if src == id_b else str(src))
            v_tgt = 'A' if tgt == id_a else ('B' if tgt == id_b else str(tgt))
            
            link_key = tuple(sorted((v_src, v_tgt)))
            if link_key not in existing_links:
                links_list.append({ 'source': v_src, 'target': v_tgt })
                existing_links.add(link_key)

    # Fetch names for intermediate nodes (the "bridge" authors)
    missing = [x for x in all_ids if x not in (id_a, id_b)]
    if missing:
        if len(missing) == 1: missing_tuple = f"({missing[0]})"
        else: missing_tuple = tuple(missing)
        
        res = db.session.execute(text(f"SELECT id, given_name, family_name FROM test_author WHERE id IN {missing_tuple}")).fetchall()
        for r in res:
            nodes_map[r.id] = { 
                'id': str(r.id), 
                'name': f"{r.given_name} {r.family_name}", 
                'group': 'intermediate' 
            }

    response_data = {
        'scores': {
            'total': match.total_score,
            'name_sim': match.name_score,
            'coauthor': match.coauthor_boost
        },
        'author_a': serialize_author(match.author_a),
        'author_b': serialize_author(match.author_b),
        'graph_data': { 'nodes': list(nodes_map.values()), 'links': links_list } # <--- Sending graph_data
    }
    return jsonify(response_data)

@app.route('/api/match/<int:id_a>/<int:id_b>/decide', methods=['POST'])
def decide_match(id_a, id_b):
    data = request.json
    decision = data.get('decision')
    custom_name = data.get('custom_name')
    
    match = MatchCandidate.query.get_or_404((id_a, id_b))
    
    if decision == 'approve':
        match.status = 'approved'
        auth_a = match.author_a
        auth_b = match.author_b
        
        master = None
        if auth_a.master_author_id:
            master = MasterAuthor.query.get(auth_a.master_author_id)
        elif auth_b.master_author_id:
            master = MasterAuthor.query.get(auth_b.master_author_id)
            
        if not master:
            final_name = (custom_name.strip() if isinstance(custom_name, str) and custom_name.strip() else f"{auth_a.given_name} {auth_a.family_name}")
            primary_orcid = auth_a.orcid_id or auth_b.orcid_id

            master = MasterAuthor(primary_orcid=primary_orcid, canonical_name=final_name)
            db.session.add(master)
            db.session.flush()

        auth_a.master_author_id = master.id
        auth_b.master_author_id = master.id
        auth_a.processing_status = 'processed'
        auth_b.processing_status = 'processed'

    elif decision == 'reject':
        match.status = 'rejected'
    
    else:
        return jsonify({'error': 'Invalid decision'}), 400
    
    db.session.commit()
    return jsonify({'success': True, 'status': match.status})

if __name__ == '__main__':
    app.run(debug=True, port=5000)