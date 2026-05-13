# Portfolio Investment-Year Audit

Run at: 2026-05-13T21:10:24.896Z

## Scope

- Company records: 1169
- Owner-company rows: 1325
- Flagged rows: 15

## Date Standard

- Use the public close/completion/financial-close year when it exists.
- Use the public announcement/signing year only when no close evidence is available.
- Earlier announcement milestones are suppressed as issue signals when the stored year is backed by close evidence for the same owner.

## Priority Summary

- critical: 0
- high: 2
- medium: 6
- low: 7
- none: 1310

## Top Flags

- secondary_owner_year_differs_from_display_year: 63
- weak_same_year_attribution: 7
- future_dated_milestone: 5
- earlier_firm_investment_signal: 2
- firm_not_named_in_same_year_milestone: 1

## Firms With Most Critical/High Rows

- DigitalBridge: 2

## Year Distribution

- 1999: 1
- 2003: 2
- 2004: 3
- 2005: 2
- 2006: 1
- 2007: 8
- 2008: 5
- 2009: 10
- 2010: 15
- 2011: 4
- 2012: 6
- 2013: 11
- 2014: 25
- 2015: 32
- 2016: 49
- 2017: 52
- 2018: 70
- 2019: 107
- 2020: 96
- 2021: 169
- 2022: 184
- 2023: 138
- 2024: 140
- 2025: 154
- 2026: 41

## Critical/High Review Queue

| Priority | Line | Firm | Company | Current Year | Flags |
|---|---:|---|---|---:|---|
| high | 15031 | DigitalBridge | Vantage Data Centers | 2020 | earlier_firm_investment_signal , secondary_owner_year_differs_from_display_year |
| high | 15031 | DigitalBridge | Vantage Data Centers | 2024 | earlier_firm_investment_signal , secondary_owner_year_differs_from_display_year |

## Files

- master.csv: every owner-company row
- flagged.csv: only rows with at least one review flag
- findings.json: machine-readable rows for follow-up sourcing and correction work
