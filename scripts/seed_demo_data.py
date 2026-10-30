import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Add backend directory to path using relative resolution
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR / "backend"))

from app.config import settings
from app.models.database import User, Case, CaseParticipant, init_db, SessionLocal
from app.core.security import hash_password
from app.services.documents import store_case_document
from app.services.audit import log_audit_action
from app.agents.orchestrator import OrchestratorAgent

SAMPLE_DOCS_DIR = BASE_DIR / "data" / "sample_documents"
SAMPLE_DOCS_DIR.mkdir(parents=True, exist_ok=True)

def create_sample_files():
    # 1. Realistic Bail Application
    bail_text = """IN THE COURT OF CHIEF JUDICIAL MAGISTRATE, PATIALA HOUSE COURTS, NEW DELHI
BAIL APPLICATION NO. 412 OF 2026
IN FIR NO. 188/2025 POLICE STATION TILAK MARG
U/S 420/468/471 OF IPC (CORRESPONDING TO SECTIONS 318/336/340 OF BHARAT NYAYA SANHITA, 2023)

IN THE MATTER OF:
RAMESH KUMAR S/O LATE HARISH KUMAR
R/O H-42, LAJPAT NAGAR, NEW DELHI, 110024
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
2. Accused: Ramesh Kumar, Age 42, S/o Harish Kumar, R/o Lajpat Nagar
3. Occurrence of Offence: Prior to 10/08/2025
4. Brief description: Allegations regarding submission of allegedly fabricated invoice documents for business credit facilities.
5. Investigating Officer: Sub-Inspector Anil Kumar (Belt No. 4920-D)
6. Action Taken: Accused arrested on 15/08/2025 and produced before Judicial Magistrate.
"""
    (SAMPLE_DOCS_DIR / "fir_delhi_police_0412.txt").write_text(fir_text, encoding="utf-8")

    # 3. Realistic Writ Petition
    wp_text = """IN THE HIGH COURT OF DELHI AT NEW DELHI
CIVIL WRIT JURISDICTION
WRIT PETITION (CIVIL) NO. 1849 OF 2026

IN THE MATTER OF:
SMT. SAVITRI DEVI (AGED 74 YEARS, SENIOR CITIZEN)
W/O LATE KRISHAN GOPAL
R/O 18/4, DEFENCE COLONY, NEW DELHI, 110024
AADHAAR: 9921 4410 8821
...PETITIONER

VERSUS

1. MUNICIPAL CORPORATION OF DELHI (MCD)
2. GOVT. OF NCT OF DELHI
...RESPONDENTS

PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA SEEKING URGENT PROVISIONAL RELIEF
AGAINST THREATENED DEMOLITION AND RESTORATION OF DISRUPTED UTILITIES

1. Petitioner is a 74-year old bedridden senior citizen and widow living alone in her ancestral home.
2. Respondent MCD issued a 7-day demolition notice under Section 343 DMC Act without affording mandatory hearing.
3. The statutory limitation to file compliance and show-cause expires in 6 days (on 04-11-2026).
4. PRAYER: Grant ex-parte ad-interim stay on notice dated 10-10-2026 pending adjudication.

FILED BY: ADV. MEERA SEN, ADVOCATE FOR PETITIONER
"""
    (SAMPLE_DOCS_DIR / "petition_savitri_devi.txt").write_text(wp_text, encoding="utf-8")

def seed_database_if_empty(db):
    if not settings.DEMO_MODE:
        return

    # Check if cases already exist
    existing_case_count = db.query(Case).count()
    if existing_case_count >= 6:
        return

    print("--- DEMO_MODE: Seeding realistic judicial demo dataset across 7 personas ---")
    create_sample_files()

    demo_pwd_hash = hash_password(settings.DEMO_PASSWORD)

    # DATA-07 / Appendix A: 11 Demo accounts across 7 personas
    users_data = [
        # 1. Judges (2)
        {"id": "u-judge-1", "name": "Hon'ble Justice K. Sharma", "email": "judge1@nyayaflow.demo", "role": "judge", "court": "Chief Judicial Magistrate, Patiala House Courts"},
        {"id": "u-judge-2", "name": "Hon'ble Justice R. Sengupta", "email": "judge2@nyayaflow.demo", "role": "judge", "court": "Delhi High Court (Single Bench)"},
        # 2. Registry Clerk (1)
        {"id": "u-clerk-1", "name": "Rajesh Verma (Head Clerk)", "email": "clerk1@nyayaflow.demo", "role": "clerk", "court": "Chief Judicial Magistrate, Patiala House Courts"},
        # 3. Advocates (2)
        {"id": "u-adv-1", "name": "Adv. Meera Sen", "email": "advocate1@nyayaflow.demo", "role": "lawyer", "court": "Chief Judicial Magistrate, Patiala House Courts"},
        {"id": "u-adv-2", "name": "Adv. Vikram Malhotra", "email": "advocate2@nyayaflow.demo", "role": "lawyer", "court": "Delhi High Court (Single Bench)"},
        # 4. Police / Investigating Officers (2)
        {"id": "u-io-1", "name": "Insp. Anil Kumar (IO)", "email": "io1@nyayaflow.demo", "role": "police", "court": "Chief Judicial Magistrate, Patiala House Courts"},
        {"id": "u-io-2", "name": "SI Priyadarshini Rao (IO)", "email": "io2@nyayaflow.demo", "role": "police", "court": "Tis Hazari Court"},
        # 5. Citizens (2)
        {"id": "u-cit-1", "name": "Ramesh Kumar (Litigant)", "email": "citizen1@nyayaflow.demo", "role": "citizen"},
        {"id": "u-cit-2", "name": "Savitri Devi (Litigant)", "email": "citizen2@nyayaflow.demo", "role": "citizen"},
        # 6. Auditor (1)
        {"id": "u-auditor-1", "name": "Pooja Hegde (Judicial Vigilance Officer)", "email": "auditor1@nyayaflow.demo", "role": "auditor"},
        # 7. Administrator (1)
        {"id": "u-admin-1", "name": "E-Courts System Administrator", "email": "admin@nyayaflow.demo", "role": "admin"}
    ]

    for ud in users_data:
        existing_user = db.query(User).filter(User.email == ud["email"]).first()
        if not existing_user:
            u = User(
                id=ud["id"],
                name=ud["name"],
                email=ud["email"],
                password_hash=demo_pwd_hash,
                role=ud["role"],
                court=ud.get("court", "Chief Judicial Magistrate, Patiala House Courts"),
                court_registry="Patiala House Courts Registry",
                status="active"
            )
            db.add(u)
    db.commit()

    now = datetime.now(timezone.utc)

    # -------------------------------------------------------------
    # 6 Synthetic Cases with Scoped Participants (DATA-07)
    # -------------------------------------------------------------
    # Case 1: Critical Urgency Bail (Advocate 1, IO 1, Citizen 1)
    case_1 = Case(
        case_number="BAIL/DEL/2026/0412",
        title="Ramesh Kumar vs. State (Govt. of NCT of Delhi)",
        court="Chief Judicial Magistrate, Patiala House Courts",
        court_id="DL-PHC-CJM-01",
        courtroom="Courtroom 3",
        case_type="Bail Application (CrPC 439 / BNSS 483)",
        status="pending",
        filing_date=(now - timedelta(days=25)).isoformat(),
        custody_flag=True,
        custody_since=(now - timedelta(days=425)).isoformat(), # 14 months custody
        statutory_deadline=(now + timedelta(days=12)).isoformat(),
        max_sentence_months=84, # 7 years
        first_time_offender=True,
        vulnerable_party=False,
        complainant="State of Delhi",
        accused="Ramesh Kumar"
    )
    db.add(case_1)
    db.commit()
    db.refresh(case_1)

    # Participants for Case 1
    db.add(CaseParticipant(case_id=case_1.id, user_id="u-judge-1", participant_role="judge"))
    db.add(CaseParticipant(case_id=case_1.id, user_id="u-clerk-1", participant_role="clerk"))
    db.add(CaseParticipant(case_id=case_1.id, user_id="u-adv-1", participant_role="advocate"))
    db.add(CaseParticipant(case_id=case_1.id, user_id="u-io-1", participant_role="investigating_officer"))
    db.add(CaseParticipant(case_id=case_1.id, user_id="u-cit-1", participant_role="litigant"))
    db.commit()

    bail_file = SAMPLE_DOCS_DIR / "bail_application_ramesh_kumar.txt"
    fir_file = SAMPLE_DOCS_DIR / "fir_delhi_police_0412.txt"
    store_case_document(db, case_1.id, bail_file.name, bail_file.read_bytes(), "Adv. Meera Sen", doc_type="bail_application")
    store_case_document(db, case_1.id, fir_file.name, fir_file.read_bytes(), "Insp. Anil Kumar", doc_type="fir")

    # Case 2: High Tier Senior Citizen Writ (Advocate 1, Citizen 1)
    case_2 = Case(
        case_number="WP/DEL/2026/1849",
        title="Smt. Savitri Devi (Senior Citizen) vs. Municipal Corporation of Delhi",
        court="Chief Judicial Magistrate, Patiala House Courts",
        court_id="DL-PHC-CJM-01",
        courtroom="Courtroom 1",
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
    db.add(case_2)
    db.commit()
    db.refresh(case_2)

    db.add(CaseParticipant(case_id=case_2.id, user_id="u-judge-1", participant_role="judge"))
    db.add(CaseParticipant(case_id=case_2.id, user_id="u-clerk-1", participant_role="clerk"))
    db.add(CaseParticipant(case_id=case_2.id, user_id="u-adv-1", participant_role="advocate"))
    db.add(CaseParticipant(case_id=case_2.id, user_id="u-cit-1", participant_role="litigant"))
    db.commit()

    pet_file = SAMPLE_DOCS_DIR / "petition_savitri_devi.txt"
    store_case_document(db, case_2.id, pet_file.name, pet_file.read_bytes(), "Adv. Meera Sen", doc_type="petition")

    # Case 3: Commercial Suit (Advocate 2, Citizen 2) -> ISOLATED from Advocate 1 and Citizen 1
    case_3 = Case(
        case_number="CS/DEL/2024/0891",
        title="Apex Logistics Pvt. Ltd. vs. Om Trading Co.",
        court="Delhi High Court (Single Bench)",
        court_id="DL-HC-SB-02",
        courtroom="Courtroom 5",
        case_type="Commercial Suit (Recovery)",
        status="pending",
        filing_date=(now - timedelta(days=780)).isoformat(),
        custody_flag=False,
        vulnerable_party=False,
        complainant="Apex Logistics Pvt. Ltd.",
        accused="Om Trading Co."
    )
    db.add(case_3)
    db.commit()
    db.refresh(case_3)

    db.add(CaseParticipant(case_id=case_3.id, user_id="u-judge-2", participant_role="judge"))
    db.add(CaseParticipant(case_id=case_3.id, user_id="u-clerk-1", participant_role="clerk"))
    db.add(CaseParticipant(case_id=case_3.id, user_id="u-adv-2", participant_role="advocate"))
    db.add(CaseParticipant(case_id=case_3.id, user_id="u-cit-2", participant_role="litigant"))
    db.commit()
    store_case_document(db, case_3.id, "commercial_plaint_0891.txt", b"Commercial recovery suit under Commercial Courts Act. Total claim Rs 42,00,000 for unpaid logistics freight charges.", "Adv. Vikram Malhotra", doc_type="petition")

    # Case 4: POCSO Criminal Trial (Advocate 2, IO 2, Citizen 2)
    case_4 = Case(
        case_number="POCSO/DEL/2026/0012",
        title="State vs. Deepak Verma (POCSO Special Court)",
        court="Chief Judicial Magistrate, Patiala House Courts",
        court_id="DL-PHC-CJM-01",
        courtroom="Courtroom 1",
        case_type="POCSO Criminal Trial",
        status="pending",
        filing_date=(now - timedelta(days=120)).isoformat(),
        custody_flag=True,
        custody_since=(now - timedelta(days=120)).isoformat(),
        max_sentence_months=120,
        vulnerable_party=True,
        vulnerability_reason="Minor Victim / Vulnerable Witness",
        complainant="State of Delhi",
        accused="Deepak Verma"
    )
    db.add(case_4)
    db.commit()
    db.refresh(case_4)

    db.add(CaseParticipant(case_id=case_4.id, user_id="u-judge-1", participant_role="judge"))
    db.add(CaseParticipant(case_id=case_4.id, user_id="u-clerk-1", participant_role="clerk"))
    db.add(CaseParticipant(case_id=case_4.id, user_id="u-adv-2", participant_role="advocate"))
    db.add(CaseParticipant(case_id=case_4.id, user_id="u-io-2", participant_role="investigating_officer"))
    db.add(CaseParticipant(case_id=case_4.id, user_id="u-cit-2", participant_role="litigant"))
    db.commit()
    store_case_document(db, case_4.id, "pocso_chargesheet.txt", b"Charge sheet under Sections 4 & 6 of POCSO Act 2012. Special protective provisions apply.", "SI Priyadarshini Rao", doc_type="charge_sheet")

    # Case 5: Habeas Corpus (Judge 2, Advocate 2, IO 1, Citizen 2)
    case_5 = Case(
        case_number="HC/DEL/2026/001",
        title="Sunita Devi vs. State & Ors. (Habeas Corpus)",
        court="Delhi High Court (Single Bench)",
        court_id="DL-HC-SB-02",
        courtroom="Courtroom 5",
        case_type="Habeas Corpus",
        status="pending",
        filing_date=(now - timedelta(days=4)).isoformat(),
        custody_flag=True,
        custody_since=(now - timedelta(days=10)).isoformat(),
        vulnerable_party=True,
        vulnerability_reason="Missing/Detained Individual",
        complainant="Sunita Devi",
        accused="State"
    )
    db.add(case_5)
    db.commit()
    db.refresh(case_5)

    db.add(CaseParticipant(case_id=case_5.id, user_id="u-judge-2", participant_role="judge"))
    db.add(CaseParticipant(case_id=case_5.id, user_id="u-clerk-1", participant_role="clerk"))
    db.add(CaseParticipant(case_id=case_5.id, user_id="u-adv-2", participant_role="advocate"))
    db.add(CaseParticipant(case_id=case_5.id, user_id="u-io-1", participant_role="investigating_officer"))
    db.add(CaseParticipant(case_id=case_5.id, user_id="u-cit-2", participant_role="litigant"))
    db.commit()
    store_case_document(db, case_5.id, "habeas_corpus_petition.txt", b"Petition under Article 226 for issuance of Writ of Habeas Corpus regarding illegal detention.", "Adv. Vikram Malhotra", doc_type="petition")

    # Case 6: Routine Administrative Weeding (Clerk 1, Judge 1)
    case_6 = Case(
        case_number="MISC/DEL/2026/0044",
        title="In Re: Periodic Record Room Inspection and Weeding",
        court="Chief Judicial Magistrate, Patiala House Courts",
        court_id="DL-PHC-CJM-01",
        courtroom="Courtroom 3",
        case_type="Miscellaneous Administrative",
        status="pending",
        filing_date=(now - timedelta(days=10)).isoformat(),
        custody_flag=False,
        vulnerable_party=False,
        complainant="Registry",
        accused="None"
    )
    db.add(case_6)
    db.commit()
    db.refresh(case_6)
    store_case_document(db, case_6.id, "inspection_memo.txt", b"Record room bi-annual inspection report and weeding out schedule.", "Rajesh Verma", doc_type="other")

    # Run Multi-Agent Orchestrator Pipeline on all 6 demo cases
    for c in [case_1, case_2, case_3, case_4, case_5, case_6]:
        OrchestratorAgent.process_case_pipeline(db, c.id, actor_id="sys-seed", actor_name="Seeder")

    # Append Genesis and System Setup Audit Logs
    log_audit_action(
        db=db,
        actor_id="system-bootstrap",
        actor_name="NyayaFlow Judicial Core",
        action="system_startup",
        object_type="system",
        object_id="genesis",
        details={"status": "seeded", "cases_count": 6, "users_count": len(users_data)}
    )

    print(f"--- Seeding completed: 6 scoped cases, 11 users across 7 personas, encrypted vaults ready. ---")

if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()
