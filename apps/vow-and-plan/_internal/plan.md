# PDF Export Bug Fix Plan

## Bugs Found

### Bug 1: CRITICAL - "Page X of 0" in all footers
- `addPageFooter(data.pageNumber, 0)` — `0` is hardcoded, not dynamic
- `totalPages` is tracked but never passed to footers
- All 10 printables + exportPDF affected

### Bug 2: HIGH - totalPages closure issue  
- `totalPages` captured at definition time, not call time
- `addPageFooter` always sees the initial `0` value

### Bug 3: MEDIUM - Cover page gets no footer
- Only autoTable pages get footers via didDrawPage
- Cover page and manual pages lack footers

### Bug 4: MEDIUM - Gradient color overflow
- `c.light[0]+(255-c.light[0])*(i/70)` can exceed 255
- Causes jsPDF color errors

### Fix Strategy
Two-pass approach:
1. Generate all content WITHOUT footers
2. After content complete: `const total = doc.getNumberOfPages()`
3. Loop all pages, add footer to each
4. Remove all broken `didDrawPage: (data)=>{addPageFooter(data.pageNumber,0)}` callbacks
