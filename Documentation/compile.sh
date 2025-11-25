#!/bin/bash
# Compilation script for TM471 Final Year Project Report
# This script compiles the LaTeX dissertation and handles bibliography

echo "==================================="
echo "TM471 Report Compilation Script"
echo "==================================="
echo ""

# Check if we're in the Documentation directory
if [ ! -f "main.tex" ]; then
    echo "Error: main.tex not found. Please run this script from the Documentation directory."
    exit 1
fi

echo "Step 1: First pdflatex compilation..."
pdflatex -interaction=nonstopmode main.tex
if [ $? -ne 0 ]; then
    echo "Error: First pdflatex compilation failed."
    exit 1
fi

echo ""
echo "Step 2: Generating bibliography..."
bibtex main
if [ $? -ne 0 ]; then
    echo "Warning: Bibliography generation failed or no citations found."
fi

echo ""
echo "Step 3: Second pdflatex compilation (including references)..."
pdflatex -interaction=nonstopmode main.tex
if [ $? -ne 0 ]; then
    echo "Error: Second pdflatex compilation failed."
    exit 1
fi

echo ""
echo "Step 4: Third pdflatex compilation (resolving all references)..."
pdflatex -interaction=nonstopmode main.tex
if [ $? -ne 0 ]; then
    echo "Error: Third pdflatex compilation failed."
    exit 1
fi

echo ""
echo "==================================="
echo "Compilation successful!"
echo "Output: main.pdf"
echo "==================================="

# Clean up auxiliary files (optional)
read -p "Do you want to clean up auxiliary files? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleaning up..."
    rm -f *.aux *.log *.out *.toc *.lof *.lot *.bbl *.blg
    rm -f chapters/*.aux frontmatter/*.aux appendices/*.aux
    echo "Cleanup complete!"
fi

echo ""
echo "Done! Open main.pdf to view your dissertation."
