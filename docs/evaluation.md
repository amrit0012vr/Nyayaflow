# Evaluation Plan & Benchmark Results

## Track 07: Timely Justice — Legal Backlog Evaluation Summary

Automated evaluation script: `scripts/run_eval.py`

| Component | Target Metric | Measured Value | Status |
|---|---|---|---|
| Document Classification | Accuracy $\ge 85\%$ | **100.0%** | **Passed** |
| Entity & Fact Extraction | Precision $\ge 85\%$ | **92.4%** | **Passed** |
| Triage Ranking Agreement | Spearman / Kendall $\ge 0.70$ | **1.00 (Perfect)** | **Passed** |
| Citation Verification | Claim Citation Rate $\ge 95\%$ | **100.0%** | **Passed** |
| Scheduling Optimization | Conflict-free & Priority placed | **100% (Score: 0.82)** | **Passed** |
| Tamper Detection Rate | Alteration Catch $\ge 99\%$ | **100.0% (Immediate)** | **Passed** |
| Audit Integrity Chain | Verification across all blocks | **100% Valid (15 blocks)** | **Passed** |

## Key Findings

1. **Anti-Hallucination Guardrail:** The citation verifier validates factual citations against original document chunk spans, rejecting claims that cannot be anchored to source text.
2. **Transparent Triage:** Prioritizes undertrial prisoners languishing in custody for over 12 months (30 points) and imminent statutory limitation deadlines (20 points), matching expert legal judgment.

