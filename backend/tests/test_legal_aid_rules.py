import pytest
from app.agents.legal_aid import LegalAidAgent
from app.schemas.schemas import EligibilityCheckRequest

def test_section_12_a_sc_st():
    req = EligibilityCheckRequest(annual_income=10_000_000, is_sc_st=True)
    res = LegalAidAgent.evaluate_eligibility(req)
    assert res["is_eligible"] is True
    assert "12(a)" in res["clause"]

def test_section_12_c_woman():
    req = EligibilityCheckRequest(annual_income=5_000_000, is_woman_or_child=True)
    res = LegalAidAgent.evaluate_eligibility(req)
    assert res["is_eligible"] is True
    assert "12(c)" in res["clause"]

def test_section_12_g_custody():
    req = EligibilityCheckRequest(annual_income=2_000_000, in_custody=True)
    res = LegalAidAgent.evaluate_eligibility(req)
    assert res["is_eligible"] is True
    assert "12(g)" in res["clause"]

def test_section_12_h_income_under_state_ceiling():
    # Delhi ceiling is 3,00,000 for District Courts
    req = EligibilityCheckRequest(annual_income=250_000, state="Delhi", court_level="district")
    res = LegalAidAgent.evaluate_eligibility(req)
    assert res["is_eligible"] is True
    assert "12(h)" in res["clause"]

def test_section_12_h_income_exceeding_ceiling_ineligible():
    req = EligibilityCheckRequest(annual_income=800_000, state="Delhi", court_level="district")
    res = LegalAidAgent.evaluate_eligibility(req)
    assert res["is_eligible"] is False

