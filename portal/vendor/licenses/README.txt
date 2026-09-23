Third-party libraries vendored in this folder, self-hosted so the site needs
no external CDN and no API keys.

  pdfjs/      pdf.js (Apache-2.0)                     -> pdfjs-LICENSE.txt
  docx/       docx-preview (MIT), jszip (MIT/GPLv3)    -> docx-preview-LICENSE.txt, jszip-LICENSE.txt
  pptx/       pptx-preview (MIT per its package.json)  -- upstream ships no LICENSE file in the npm
                                                           package itself; check the project's GitHub
                                                           repository if you need the exact license text.
  xlsx/       SheetJS "xlsx" (Apache-2.0)               -> sheetjs-LICENSE.txt
  markdown/   marked (MIT), DOMPurify (Apache-2.0/MPL-2.0),
              highlight.js (BSD-3-Clause), KaTeX (MIT)  -> marked-LICENSE.txt, dompurify-LICENSE.txt,
                                                            highlightjs-LICENSE.txt, katex-LICENSE.txt
  fonts/      Literata, Public Sans, JetBrains Mono     -> font-*-LICENSE.txt (all OFL-1.1)
