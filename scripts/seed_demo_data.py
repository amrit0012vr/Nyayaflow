import os
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.models.database import User, Case, Document, DocumentVersion, TriageResult, Summary, Hearing, init_db, SessionLocal
from app.core.security import hash_password
from app.services.documents import store_case_document
from app.services.audit import log_audit_action
from app.agents.orchestrator import OrchestratorAgent

SAMPLE_DOCS_DIR = Path(__file__).resolve().parent.parent / "data" / "sample_documents"
SAMPLE_DOCS_DIR.mkdir(parents=True, exist_ok=True)

def create_sample_files():
    # 1. Realistic Bail Application
    bail_text = """IN THE COURT OF CHIEF JUDICIAL MAGISTRATE, PATIALA HOUSE COURTS, NEW DELHI
BAIL APPLICATION NO. 412 OF 2026
IN FIR NO. 188/2025 POLICE STATION TILAK MARG
U/S 420/468/471 OF IPC (CORRESPONDING TO SECTIONS 318/336/340 OF BHARAT NYAYA SANHITA, 2023)

IN THE MATTER OF:
RAMESH KUMAR S/O LATE HARISH KUMAR
R/O H-42, LAJPAT NAGAR, NEW DELHI
AADHAAR NO: 4892 8192 1029, PHONE: +91 9811223344
...APPLICANT / ACCUSED

VERSUS

STATE (GOVT. OF NCT OF DELHI)
...RESPONDENT

APPLICATION UNDER SECTION 439 OF THE CODE OF CRIMINAL PROCEDURE, 1973
(SECTION 483 OF BHARATIYA NAGARIK SURAKSHA SANHITA, 2023) FOR GRANT OF REGULAR BAIL

MOST RESPECTFULLY SHOWETH:
1. That the applicant was arrested by the investigating agency on 15th August 2025 and has been languishing in Tihar Central Jail No. 4 in continuous judicial custody for 14 months without commencement of trial.
2. That the investigation is complete, and the Final Report under Section 173 CrPC has already been filed before this Hon'ble Court.
3. That the maximum sentence for the alleged offenses is 7 years, and the applicant has already undergone substantial pre-trial incarceration violating fundamental rights guaranteed under Article 21 of the Constitution of India.
4. That the applicant is a respectable citizen with deep roots in society, suffering from severe chronic pulmonary ailments, and there is zero flight risk or apprehension of tampering with evidence.
5. PRAYER: It is therefore most respectfully prayed that this Hon'ble Court may be pleased to release the applicant on regular bail in the interest of justice.

FILED BY:
ADV. MEERA SEN (ENROLMENT NO. D/482/2012)
COUNSEL FOR APPLICANT
DATE: 2026-10-20
"""
    (SAMPLE_DOCS_DIR / "bail_application_ramesh_kumar.txt").write_text(bail_text, encoding="utf-8")

    # 2. Realistic FIR
    fir_text = """FIRST INFORMATION REPORT (Under Section 154 Cr.P.C. / Section 173 BNSS)
DISTRICT: NEW DELHI | POLICE STATION: TILAK MARG | YEAR: 2025
FIR NO: 0188 | DATE OF REGISTRATION: 14/08/2025 18:30 HRS
ACTS & SECTIONS: Indian Penal Code 1860, Sections 420, 468, 471 (BNS Sections 318, 336, 340)

1. Complainant: State of Delhi (on complaint of Bank of Baroda Commercial Branch)
2. Accused: Ramesh Kumar, Age 42, S/o Harish Kumar
3. Occurrence of Offence: Prior to 10/08/2025
4. Brief Facts: Allegations of submitting forged trade invoices to obtain working capital facility.
5. Investigating Officer: Inspector Anil Kumar (Belt No. 4921-D)
6. Action Taken: Case registered, accused arrested on 15/08/2025 and remanded to judicial custody.
"""
    (SAMPLE_DOCS_DIR / "fir_delhi_police_0412.txt").write_text(fir_text, encoding="utf-8")

    # 3. Senior Citizen Petition
    petition_text = """IN THE HIGH COURT OF DELHI AT NEW DELHI
WRIT PETITION (CIVIL) NO. 1849 OF 2026
IN THE MATTER OF:
SMT. SAVITRI DEVI, AGED 74 YEARS (SENIOR CITIZEN)
W/O LATE BRIG. S.N. SHARMA
RESIDING AT C-14, DEFENCE COLONY, NEW DELHI
AADHAAR: 9921 4455 1122
...PETITIONER

VERSUS

MUNICIPAL CORPORATION OF DELHI & ANR.
...RESPONDENTS

URGENT PETITION UNDER ARTICLE 226 OF THE CONSTITUTION FOR EXPEDITED INTERIM RELIEF
1. The Petitioner is a 74-year-old bedridden widow and senior citizen entitled to priority adjudication under High Court Senior Citizen Fast-Track Rules.
2. The Respondents have issued an arbitrary demolition notice with statutory limitation expiring within 7 days (on 2026-11-04).
3. Irreparable injury and homelessness will result if urgent interim protection is not considered immediately by this Hon'ble Court.
"""
    (SAMPLE_DOCS_DIR / "petition_savitri_devi.txt").write_text(petition_text, encoding="utf-8")

def seed_database_if_empty(db):
    if db.query(User).count() > 0:
        return # Already seeded

    print("--- Seeding NyayaFlow Initial Demo Data ---")
    create_sample_files()

    # 1. Create Core Role Users
    default_pw = hash_password("Justice2026!")
    users = [
        User(name="Hon'ble Justice K. Sharma", email="judge@nyayaflow.gov.in", password_hash=default_pw, role="judge", org="Delhi High Court / Sessions Bench"),
        User(name="Rajesh Verma (Head Clerk)", email="clerk@nyayaflow.gov.in", password_hash=default_pw, role="clerk", org="District Registry Office"),
        User(name="Adv. Meera Sen", email="lawyer@nyayaflow.org", password_hash=default_pw, role="lawyer", org="Delhi Bar Association"),
        User(name="Insp. Anil Kumar (IO)", email="police@delhipolice.gov.in", password_hash=default_pw, role="police", org="Delhi Police Crime Branch"),
        User(name="Sunita Devi", email="citizen@nyayaflow.org", password_hash=default_pw, role="citizen", org="Litigant"),
        User(name="P. Mathur (Chief Auditor)", email="auditor@nyayaflow.gov.in", password_hash=default_pw, role="auditor", org="Judicial Vigilance Directorate"),
        User(name="System Administrator", email="admin@nyayaflow.gov.in", password_hash=default_pw, role="admin", org="e-Courts Infrastructure Unit")
    ]
    db.add_all(users)
    db.commit()

    # Log genesis audit entry
    log_audit_action(
        db=db,
        actor_id="sys-genesis",
        actor_name="NyayaFlow System Init",
        action="genesis_initialization",
        object_type="system",
        object_id="nyayaflow-core",
        details={"version": "1.0.0", "track": "07-Timely-Justice", "standards": "DPDP-2023"}
    )

    now = datetime.now(timezone.utc)

    # 2. Case 1: Critical Tier (Undertrial in custody 14 months)
    case_critical = Case(
        case_number="BAIL/DEL/2026/0412",
        title="Ramesh Kumar vs. State (Govt. of NCT of Delhi)",
        court="Chief Judicial Magistrate, Patiala House Courts",
        case_type="Bail Application (CrPC 439 / BNSS 483)",
        status="pending",
        filing_date=(now - timedelta(days=25)).isoformat(),
        custody_flag=True,
        custody_since=(now - timedelta(days=425)).isoformat(), # 14 months in custody
        statutory_deadline=(now + timedelta(days=12)).isoformat(),
        vulnerable_party=False,
        complainant="State of Delhi",
        accused="Ramesh Kumar"
    )
    db.add(case_critical)
    db.commit()
    db.refresh(case_critical)

    # Ingest Case 1 Documents
    bail_file = SAMPLE_DOCS_DIR / "bail_application_ramesh_kumar.txt"
    fir_file = SAMPLE_DOCS_DIR / "fir_delhi_police_0412.txt"
    store_case_document(db, case_critical.id, bail_file.name, bail_file.read_bytes(), "Adv. Meera Sen", doc_type="bail_application")
    store_case_document(db, case_critical.id, fir_file.name, fir_file.read_bytes(), "Insp. Anil Kumar", doc_type="fir")

    # 3. Case 2: High Tier (Senior citizen, 74 yrs, deadline in 7 days)
    case_high = Case(
        case_number="WP/DEL/2026/1849",
        title="Smt. Savitri Devi (Senior Citizen) vs. Municipal Corporation of Delhi",
        court="Delhi High Court (Single Bench)",
        case_type="Writ Petition (Interim Relief)",
        status="pending",
        filing_date=(now - timedelta(days=8)).isoformat(),
        custody_flag=False,
        statutory_deadline=(now + timedelta(days=6)).isoformat(), # 6 days remaining
        vulnerable_party=True,
        vulnerability_reason="Senior Citizen (74 Years, Bedridden)",
        complainant="Smt. Savitri Devi",
        accused="MCD"
    )
    db.add(case_high)
    db.commit()
    db.refresh(case_high)

    pet_file = SAMPLE_DOCS_DIR / "petition_savitri_devi.txt"
    store_case_document(db, case_high.id, pet_file.name, pet_file.read_bytes(), "Adv. Meera Sen", doc_type="petition")

    # 4. Case 3: Normal Tier (Commercial Suit, 2 years old)
    case_normal = Case(
        case_number="CS/DEL/2024/0891",
        title="Apex Logistics Pvt. Ltd. vs. Om Trading Co.",
        court="Commercial Court, Tis Hazari",
        case_type="Commercial Suit (Recovery)",
        status="pending",
        filing_date=(now - timedelta(days=780)).isoformat(), # ~2.1 years old
        custody_flag=False,
        vulnerable_party=False,
        complainant="Apex Logistics Pvt. Ltd.",
        accused="Om Trading Co."
    )
    db.add(case_normal)
    db.commit()
    db.refresh(case_normal)
    store_case_document(db, case_normal.id, "commercial_plaint_0891.txt", b"Commercial recovery suit under Commercial Courts Act. Total claim Rs 42,00,000 for unpaid logistics freight charges.", "Rajesh Verma", doc_type="petition")

    # 5. Case 4: Low Tier (Routine Administrative)
    case_low = Case(
        case_number="MISC/DEL/2026/0044",
        title="In Re: Periodic Record Room Inspection and Weeding",
        court="Principal District & Sessions Judge",
        case_type="Miscellaneous Administrative",
        status="pending",
        filing_date=(now - timedelta(days=10)).isoformat(),
        custody_flag=False,
        vulnerable_party=False,
        complainant="Registry",
        accused="None"
    )
    db.add(case_low)
    db.commit()
    db.refresh(case_low)
    store_case_document(db, case_low.id, "inspection_memo.txt", b"Record room bi-annual inspection report and weeding out schedule.", "Rajesh Verma", doc_type="other")

    # Run Multi-Agent Orchestrator Pipeline on all demo cases
    for c in [case_critical, case_high, case_normal, case_low]:
        OrchestratorAgent.process_case_pipeline(db, c.id, actor_id="sys-seed", actor_name="Seeder")

    print(f"--- Seeding completed: 4 cases triaged across tiers, documents encrypted, hash chain initialized. ---")

if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()
