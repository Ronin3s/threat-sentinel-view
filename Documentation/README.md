# TM471 Final Year Project Report - Threat Sentinel

## Documentation Structure

This directory contains the complete LaTeX source code for the TM471 Final Year Project dissertation for Arab Open University.

## Project Title
**Threat Sentinel: An Integrated Cybersecurity Threat Analysis and Visualization Platform**

## File Structure

```
Documentation/
├── main.tex                    # Main LaTeX document
├── references.bib              # Bibliography file (Harvard style)
├── frontmatter/
│   ├── titlepage.tex          # Title page
│   ├── declaration.tex        # Signed declaration
│   ├── abstract.tex           # Abstract (150 words)
│   └── acknowledgments.tex    # Acknowledgments
├── chapters/
│   ├── chapter1.tex           # Introduction
│   ├── chapter2.tex           # Literature Review
│   ├── chapter3.tex           # Requirements and Analysis
│   ├── chapter4.tex           # Design, Implementation, and Testing
│   ├── chapter5.tex           # Results and Discussion
│   └── chapter6.tex           # Conclusion
└── appendices/
    └── appendixA.tex          # Questionnaire, Interview Questions, etc.
```

## Compilation Instructions

### Prerequisites

1. **LaTeX Distribution:**
   - **Linux:** Install TeX Live
     ```bash
     sudo apt-get install texlive-full
     ```
   - **macOS:** Install MacTeX from https://www.tug.org/mactex/
   - **Windows:** Install MiKTeX from https://miktex.org/

2. **Required Packages:**
   All required packages are included in the TeX Live full installation:
   - times (Times New Roman font)
   - graphicx (images)
   - natbib (Harvard referencing)
   - And others specified in main.tex

### Compiling the Document

#### Method 1: Using pdflatex and bibtex (Recommended)

```bash
cd Documentation

# First compilation
pdflatex main.tex

# Generate bibliography
bibtex main

# Second compilation (to include references)
pdflatex main.tex

# Third compilation (to resolve all references)
pdflatex main.tex
```

#### Method 2: Using latexmk (Automated)

```bash
cd Documentation
latexmk -pdf main.tex
```

#### Method 3: Using an IDE

- **Overleaf:** Upload all files to Overleaf and compile
- **TeXstudio:** Open main.tex and press F5 to compile
- **VS Code with LaTeX Workshop:** Open main.tex and use the LaTeX commands

### Output

The compilation will generate `main.pdf` containing the complete dissertation.

## Customization Required

Before compiling, please update the following placeholders:

### Title Page (frontmatter/titlepage.tex)
- `[Branch Name]` - Your AOU branch
- `[Student Name]` - Your full name
- `[Student ID]` - Your student ID
- `[Supervisor Name]` - Your project supervisor's name
- Replace `logo.png` with actual AOU logo image

### Declaration (frontmatter/declaration.tex)
- `[Supervisor Name]` - Your supervisor's name
- `[Student Name]` - Your full name
- `[Student ID]` - Your student ID

### Image Placeholders

The document contains placeholder comments for images/diagrams:
- `% [IMAGE PLACEHOLDER: UNIVERSITY LOGO]`
- `% [DIAGRAM PLACEHOLDER: Use Case Diagram]`
- `% [DIAGRAM PLACEHOLDER: DFD Level 0]`
- `% [DIAGRAM PLACEHOLDER: DFD Level 1]`
- `% [DIAGRAM PLACEHOLDER: Additional UML Diagram]`
- `% [DIAGRAM PLACEHOLDER: System Architecture]`
- `% [DIAGRAM PLACEHOLDER: UI Wireframes]`

Replace these with actual images by:
1. Creating the diagrams using tools like draw.io, Lucidchart, or PlantUML
2. Saving them as PNG or PDF files
3. Placing them in an `images/` subdirectory
4. Updating the `\includegraphics` commands with correct paths

## Document Specifications

This dissertation follows AOU TM471 formatting requirements:

- **Font:** Times New Roman (12pt for main text, 10pt for captions)
- **Line Spacing:** 1.5
- **Page Margins:** 
  - Left: 1.5 inches
  - Right, Top, Bottom: 1 inch
- **Page Numbering:**
  - Front matter: Roman numerals (i, ii, iii...)
  - Main content: Arabic numerals starting from 1
- **Referencing:** Harvard style (author-date)
- **Word Count:** 3500-4500 words (main chapters)

## Chapter Overview

### Chapter 1: Introduction
Background, problem statement, aims/objectives, scope, target users, system description, report structure

### Chapter 2: Literature Review (5+ pages)
Synthetic review of related work, comparison table, gap analysis, justification for Threat Sentinel

### Chapter 3: Requirements and Analysis
Functional/non-functional requirements, software/hardware specs, system analysis, UML diagrams, ethics/legal/social issues (Part A)

### Chapter 4: Design, Implementation, and Testing
System architecture, design decisions, implementation details, algorithms, comprehensive testing methodology

### Chapter 5: Results and Discussion
System results, objectives achievement analysis, future work, ethics/legal/social implications (Part B)

### Chapter 6: Conclusion
Summary of achievements, contributions, lessons learned, limitations, future directions, final reflections

## References

The bibliography uses Harvard (author-date) style via the `agsm` bibliography style. Citations in the text use `\citep{}` for parenthetical citations.

To add new references:
1. Edit `references.bib`
2. Add entry in BibTeX format
3. Cite in text using `\citep{key}` or `\citet{key}`
4. Recompile with bibtex

## Troubleshooting

### Missing packages
```bash
# Install missing packages (TeX Live)
sudo tlmgr install <package-name>
```

### References not appearing
Make sure you run bibtex between pdflatex runs:
```bash
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

### Images not displaying
- Ensure image files are in the correct directory
- Check file paths in `\includegraphics{}`
- Verify image formats (PNG, PDF, JPG are supported)

### Font issues
If Times New Roman doesn't work, the `times` package provides a close alternative. For exact Times New Roman, use XeLaTeX instead:
```bash
xelatex main.tex
```

## Word Count

To count words in the main chapters (excluding front matter, references, appendices):

```bash
texcount -inc -sum chapters/*.tex
```

Target: 3500-4500 words for the main content chapters.

## License

This dissertation template follows AOU academic requirements and is created for educational purposes.

## Support

For LaTeX-specific help:
- LaTeX Project: https://www.latex-project.org/
- TeX Stack Exchange: https://tex.stackexchange.com/
- Overleaf Documentation: https://www.overleaf.com/learn

For AOU-specific requirements, consult your TM471 project handbook and supervisor.

---

**Created:** November 2024  
**Student:** [Your Name]  
**Course:** TM471 - Final Year Project  
**Institution:** Arab Open University
