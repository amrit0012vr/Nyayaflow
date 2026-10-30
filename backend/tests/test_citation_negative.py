import pytest
from app.models.database import SessionLocal, Chunk
from app.services.verification import CitationVerifier

@pytest.fixture(scope="module")
def setup_test_chunk():
    db = SessionLocal()
    chunk = db.query(Chunk).filter(Chunk.document_id == "doc-verify-test", Chunk.page == 1).first()
    if not chunk:
        chunk = Chunk(
            document_id="doc-verify-test",
            page=1,
            text_redacted="The accused was arrested on 12th August 2024 at 16:30 hours near Old Subzi Mandi, Delhi."
        )
        db.add(chunk)
        db.commit()
    db.close()
    return "doc-verify-test"

def test_exact_citation_passes(setup_test_chunk):
    db = SessionLocal()
    try:
        citations = [{
            "document_id": setup_test_chunk,
            "page": 1,
            "excerpt": "accused was arrested on 12th August 2024"
        }]
        res = CitationVerifier.verify_citations(db, "case-1", citations)
        assert res["verified"] is True
        assert res["valid_count"] == 1
    finally:
        db.close()

def test_hallucinated_citation_rejected(setup_test_chunk):
    db = SessionLocal()
    try:
        citations = [{
            "document_id": setup_test_chunk,
            "page": 1,
            "excerpt": "The accused confessed to possessing 500 grams of contraband narcotics on the spot."
        }]
        res = CitationVerifier.verify_citations(db, "case-1", citations)
        assert res["verified"] is False
        assert res["invalid_count"] == 1
    finally:
        db.close()

def test_nonexistent_page_rejected(setup_test_chunk):
    db = SessionLocal()
    try:
        citations = [{
            "document_id": setup_test_chunk,
            "page": 99,
            "excerpt": "Some arbitrary claim"
        }]
        res = CitationVerifier.verify_citations(db, "case-1", citations)
        assert res["verified"] is False
    finally:
        db.close()
