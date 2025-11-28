# TM471 Final Year Project Report - SIREN

## Documentation Structure

This directory contains the complete LaTeX source code for the TM471 Final Year Project dissertation for Arab Open University.

## Project Title
**SIREN: Smart Incident Response & Event Notifier**

## File Structure

```
Documentation/
├── main.tex                    # Main LaTeX document
├── references.bib              # Bibliography file (Harvard style)
├── compile.sh                  # Automated compilation script
├── README.md                   # This file
├── frontmatter/
│   ├── titlepage.tex          # Title page
│   ├── declaration.tex        # Signed declaration
│   ├── abstract.tex           # Abstract
│   └── acknowledgments.tex    # Acknowledgments
└── chapters/
    ├── chapter1.tex           # Introduction
    ├── chapter2.tex           # Review of Tools and Related Work
    ├── chapter3.tex           # Requirements and System Analysis
    ├── chapter4.tex           # System Design
    ├── chapter5.tex           # Implementation
    ├── chapter6.tex           # Testing and Evaluation
    └── conclusion.tex         # Conclusion
```

## Compilation Instructions

### Quick Start
```bash
cd Documentation
./compile.sh
```

### Manual Compilation
```bash
cd Documentation
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

## Document Specifications

This dissertation follows AOU TM471 formatting requirements:

- **Font:** Times New Roman (12pt for main text, 10pt for captions)
- **Line Spacing:** 1.5
- **Page Margins:** Left: 1.5", Right/Top/Bottom: 1"
- **Page Numbering:** Roman numerals for front matter, Arabic for main content
- **Referencing:** Harvard style (author-date)
- **Target Length:** 35-40 pages

## Chapter Overview

### Chapter 1: Introduction
Sections 1.1-1.10 covering:
- Overview of SOC challenges and SIREN's solution
- Problem definition (5 critical challenges)
- Project aim
- Primary and secondary objectives
- Deliverables (7 components)
- Scope (within and outside)
- Target customers (4 categories)
- Suggested solution (architecture overview)
- Next chapter summary
- Gantt chart with project timeline

### Chapter 2: Review of Tools and Related Work
- Overview of existing research
- Three related studies with detailed analysis:
  1. **SOAR Platforms** - Methodology, similarities, differences
  2. **Machine Learning Detection** - Methodology, similarities, differences
  3. **Open-Source SIEM** - Methodology, similarities, differences
- Comparison table (10 dimensions)
- ASCII gap analysis diagram
- Summary and justification

### Chapter 3: Requirements and System Analysis
- Functional Requirements (FR1-FR10)
- Technical Requirements (TR1-TR7)
- Business Requirements (BR1-BR5)
- Non-Functional Requirements (NFR1-NFR8)
- Software and Hardware Requirements
- ASCII UML Diagrams:
  - Data Flow Diagram (with detailed explanation)
  - Use Case Diagram (with actor descriptions)
  - Activity Diagram (incident workflow)
- Tools Used (development, testing, deployment)
- Code of Ethics (comprehensive ethical considerations)

### Chapter 4: System Design
- Architecture design with ASCII system diagram
- Component responsibilities (Frontend, Backend, Database, Agent)
- Database schema design with ASCII ER diagram
- Interface design (Dashboard, Investigation, Configuration)
- API design with endpoint structure
- Authentication design (JWT-based)
- Security design (encryption, access control)
- Scalability design (horizontal scaling, optimization)

### Chapter 5: Implementation
- Development approach (iterative 8-sprint methodology)
- Backend implementation:
  - FastAPI application structure
  - Event ingestion, correlation engine, alert service
- Frontend implementation:
  - React application structure
  - Dashboard and investigation interfaces
- Windows Agent implementation
- Database implementation with migrations
- Implementation challenges and solutions (3 major challenges)
- Technology stack utilization
- Code quality practices and testing strategy

### Chapter 6: Testing and Evaluation
- Testing methodology (unit, integration, system, performance, usability)
- Unit testing results:
  - 95 backend tests (82% coverage)
  - 44 frontend tests (76% coverage)
- Integration testing (32 tests)
- System testing (10 functional tests)
- Performance testing (15,000 events, detailed metrics)
- Usability testing (5 participants, 4.5/5 satisfaction)
- Evaluation against objectives:
  - 4/4 primary objectives fully achieved
  - 3/4 secondary objectives fully achieved
  - Overall: 87.5% completion rate
- Requirements validation
- Known issues and limitations

### Conclusion
- Project summary and achievements
- Technical accomplishments
- Objectives achievement analysis
- Requirements fulfillment
- Contributions (practical, technical, educational)
- Lessons learned (technical and project management)
- Current limitations
- Future work recommendations
- Final remarks

## Customization Required

Before compiling, update these placeholders:

1. **Title Page** (`frontmatter/titlepage.tex`):
   - `[Branch Name]` → Your AOU branch
   - `[Student Name]` → Your full name
   - `[Student ID]` → Your student ID
   - `[Supervisor Name]` → Your supervisor's name
   - Add AOU logo image file

2. **Declaration** (`frontmatter/declaration.tex`):
   - `[Supervisor Name]` → Your supervisor's name
   - `[Student Name]` → Your full name
   - `[Student ID]` → Your student ID

## Key Features

### SIREN System Architecture
The documentation describes a three-tier architecture:
- **Frontend:** React TypeScript web application
- **Backend:** Python FastAPI REST API server
- **Database:** PostgreSQL for event and incident storage
- **Agent:** Lightweight Python Windows agent for event collection

### Content Highlights
- ✅ 35-40 page target length
- ✅ Complete TM471 structure compliance
- ✅ Three related research studies with comparative analysis
- ✅ Comprehensive requirements specification
- ✅ ASCII diagrams for all UML models
- ✅ Detailed Code of Ethics section
- ✅ Harvard-style referencing
- ✅ Gantt chart project timeline

## Compilation Output

The compilation generates `main.pdf` containing the complete dissertation with:
- Title page
- Declaration
- Abstract
- Acknowledgments
- Table of Contents
- List of Figures
- List of Tables
- Three main chapters
- References
- (Optional) Appendices

## Project Focus

SIREN addresses critical challenges in security operations:
- **Alert Overload:** Analysts overwhelmed by thousands of daily alerts
- **Manual Correlation:** Time-consuming event correlation across tools
- **Delayed Response:** Hours/days between detection and response
- **Fragmented Visibility:** Security data silos prevent comprehensive understanding
- **Inefficient Communication:** Manual notification and coordination processes

SIREN solution provides:
- Automated event correlation from Windows endpoints
- Real-time dashboard for security monitoring
- Intelligent alerting based on severity and escalation policies
- Integrated incident investigation workflows
- Historical analysis and reporting capabilities

## Target Audience

- Small to Medium Enterprises (SMEs)
- Managed Security Service Providers (MSSPs)
- Educational Institutions
- Security Operations Centers

## Technologies

- **Frontend:** React 18, TypeScript, TanStack Router, Recharts
- **Backend:** Python FastAPI, SQLAlchemy, Uvicorn
- **Database:** PostgreSQL
- **Agent:** Python 3.8+ with pywin32
- **Deployment:** Docker, Docker Compose, Nginx

## License

This dissertation template follows AOU academic requirements and is created for educational purposes.

---

**Created:** November 2024  
**Project:** SIREN - Smart Incident Response & Event Notifier  
**Course:** TM471 - Final Year Project  
**Institution:** Arab Open University
