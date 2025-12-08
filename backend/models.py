from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSONB

db = SQLAlchemy()

# --- 1. Association Table ---
authorship = db.Table('test_authorship',
    db.Column('author_id', db.Integer, db.ForeignKey('test_author.id', ondelete='CASCADE'), primary_key=True),
    db.Column('publication_id', db.Integer, db.ForeignKey('test_publication.id', ondelete='CASCADE'), primary_key=True)
)

# --- 2. Main Data Tables ---

class Author(db.Model):
    __tablename__ = 'test_author'
    id = db.Column(db.Integer, primary_key=True)
    orcid_id = db.Column(db.String(19), unique=True, nullable=False)
    given_name = db.Column(db.String(150))
    family_name = db.Column(db.String(150))
    raw_affiliation_string = db.Column(db.Text)
    is_control_group = db.Column(db.Boolean, default=False)
    processing_status = db.Column(db.String(20), default='unprocessed')
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Foreign Key to Master Author
    master_author_id = db.Column(db.Integer, db.ForeignKey('master_author.id'))
    
    # Relationships
    aliases = db.relationship('AuthorAlias', backref='author', lazy=True)
    publications = db.relationship('Publication', secondary=authorship, backref='authors')

class Publication(db.Model):
    __tablename__ = 'test_publication'
    id = db.Column(db.Integer, primary_key=True)
    doi = db.Column(db.String(255), unique=True)
    title = db.Column(db.Text)
    publication_year = db.Column(db.SmallInteger)
    venue_name = db.Column(db.String(255))

class AuthorAlias(db.Model):
    __tablename__ = 'test_author_alias'
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer, db.ForeignKey('test_author.id', ondelete='CASCADE'))
    alias_name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

# --- 3. Match Candidates (Composite PK) ---

class MatchCandidate(db.Model):
    __tablename__ = 'match_candidates'
    
    author_id_a = db.Column(db.Integer, db.ForeignKey('test_author.id'), primary_key=True)
    author_id_b = db.Column(db.Integer, db.ForeignKey('test_author.id'), primary_key=True)
    
    name_score = db.Column(db.Float, default=0)
    coauthor_boost = db.Column(db.Float, default=0)
    total_score = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='pending')
    
    # Relationships to access the authors directly
    author_a = db.relationship('Author', foreign_keys=[author_id_a])
    author_b = db.relationship('Author', foreign_keys=[author_id_b])

# --- 4. Golden Master Tables ---

class MasterAuthor(db.Model):
    __tablename__ = 'master_author'
    id = db.Column(db.Integer, primary_key=True)
    primary_orcid = db.Column(db.String(19), unique=True, nullable=True)
    canonical_name = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Relationships
    linked_authors = db.relationship('Author', backref='master_author', lazy=True)
    entries = db.relationship('MasterAuthorEntry', backref='master_author', lazy=True)

class MasterAuthorEntry(db.Model):
    __tablename__ = 'master_author_entry'
    id = db.Column(db.Integer, primary_key=True)
    
    master_author_id = db.Column(db.Integer, db.ForeignKey('master_author.id', ondelete='SET NULL'))
    original_candidate_id = db.Column(db.Integer) # Refers to test_author.id snapshot
    publication_id = db.Column(db.Integer) 
    
    raw_orcid = db.Column(db.String(19))
    raw_name = db.Column(db.String(255))
    raw_affiliation = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())