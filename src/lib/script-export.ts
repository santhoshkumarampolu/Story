/**
 * Script Export Utilities
 * Functions for exporting scripts in various formats (Fountain, PDF, FDX, TXT)
 */

interface ScriptExportData {
  title: string;
  author?: string;
  idea?: string;
  logline?: string;
  treatment?: string;
  synopsis?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  characters?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scenes?: any[];
  fullScript?: string;
}

/**
 * Format script content as Fountain markup
 * Fountain is a simple markup syntax for writing screenplays
 * https://fountain.io/syntax
 */
export function formatAsFountain(data: ScriptExportData): string {
  const lines: string[] = [];
  
  // Title page metadata
  lines.push('Title: ' + data.title);
  if (data.author) {
    lines.push('Author: ' + data.author);
  }
  lines.push('Draft date: ' + new Date().toLocaleDateString());
  lines.push('');
  lines.push('==='); // Page break after title page
  lines.push('');
  
  // If there's a full script, use it as the main content
  if (data.fullScript) {
    lines.push(data.fullScript);
  } else {
    // Otherwise, compile from scenes
    if (data.scenes && data.scenes.length > 0) {
      data.scenes.forEach((scene, index) => {
        // Scene heading (slug line)
        const location = scene.location || 'UNKNOWN LOCATION';
        const time = scene.timeOfDay || 'DAY';
        const heading = location.toUpperCase().startsWith('INT') || location.toUpperCase().startsWith('EXT')
          ? location.toUpperCase()
          : `INT. ${location.toUpperCase()} - ${time.toUpperCase()}`;
        
        lines.push(heading);
        lines.push('');
        
        // Scene content
        if (scene.script) {
          lines.push(scene.script);
        } else if (scene.summary) {
          lines.push(scene.summary);
        }
        
        lines.push('');
        lines.push(''); // Double line break between scenes
      });
    }
  }
  
  return lines.join('\n');
}

/**
 * Format script as plain text with screenplay formatting hints
 */
export function formatAsPlainText(data: ScriptExportData): string {
  const lines: string[] = [];
  const separator = '=' .repeat(60);
  const divider = '-'.repeat(40);
  
  // Header
  lines.push(separator);
  lines.push(data.title.toUpperCase());
  lines.push(separator);
  if (data.author) {
    lines.push(`Written by: ${data.author}`);
  }
  lines.push(`Export Date: ${new Date().toLocaleDateString()}`);
  lines.push('');
  lines.push('');
  
  // Logline
  if (data.logline) {
    lines.push('LOGLINE');
    lines.push(divider);
    lines.push(data.logline);
    lines.push('');
    lines.push('');
  }
  
  // Synopsis/Treatment
  if (data.synopsis || data.treatment) {
    lines.push('SYNOPSIS / TREATMENT');
    lines.push(divider);
    lines.push(data.synopsis || data.treatment || '');
    lines.push('');
    lines.push('');
  }
  
  // Characters
  if (data.characters && data.characters.length > 0) {
    lines.push('CHARACTERS');
    lines.push(divider);
    data.characters.forEach((char) => {
      lines.push(`\n${char.name.toUpperCase()}`);
      if (char.description) lines.push(`  ${char.description}`);
      if (char.motivation) lines.push(`  Motivation: ${char.motivation}`);
      if (char.backstory) lines.push(`  Backstory: ${char.backstory}`);
      if (char.arc) lines.push(`  Character Arc: ${char.arc}`);
    });
    lines.push('');
    lines.push('');
  }
  
  // Full Script
  lines.push('SCREENPLAY');
  lines.push(separator);
  lines.push('');
  
  if (data.fullScript) {
    lines.push(data.fullScript);
  } else if (data.scenes && data.scenes.length > 0) {
    data.scenes.forEach((scene, index) => {
      const location = scene.location || 'UNKNOWN LOCATION';
      const time = scene.timeOfDay || 'DAY';
      const heading = location.toUpperCase().startsWith('INT') || location.toUpperCase().startsWith('EXT')
        ? location.toUpperCase()
        : `INT. ${location.toUpperCase()} - ${time.toUpperCase()}`;
      
      lines.push(heading);
      lines.push('');
      
      if (scene.script) {
        lines.push(scene.script);
      } else if (scene.summary) {
        lines.push(scene.summary);
      }
      
      lines.push('');
      lines.push('');
    });
  }
  
  // Footer
  lines.push('');
  lines.push(separator);
  lines.push('THE END');
  lines.push(separator);
  
  return lines.join('\n');
}

/**
 * Format script as Final Draft XML (.fdx)
 * This is a simplified FDX format - professional use may need more detailed formatting
 */
export function formatAsFinalDraft(data: ScriptExportData): string {
  const escapeXml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };
  
  const paragraphs: string[] = [];
  
  // Parse the full script or scenes into FDX paragraphs
  const scriptContent = data.fullScript || '';
  const scriptLines = scriptContent.split('\n');
  
  let currentType = 'Action';
  
  scriptLines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Detect scene headings
    if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(trimmedLine)) {
      currentType = 'Scene Heading';
    }
    // Detect character names (all caps followed by dialogue)
    else if (/^[A-Z][A-Z\s]+$/.test(trimmedLine) && trimmedLine.length < 40) {
      currentType = 'Character';
    }
    // Detect parentheticals
    else if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
      currentType = 'Parenthetical';
    }
    // After character or parenthetical, assume dialogue
    else if (currentType === 'Character' || currentType === 'Parenthetical') {
      currentType = 'Dialogue';
    }
    // Transitions (CUT TO, FADE OUT, etc.)
    else if (/^(CUT TO|FADE|DISSOLVE|SMASH CUT|MATCH CUT)/i.test(trimmedLine)) {
      currentType = 'Transition';
    }
    // Default to action
    else {
      currentType = 'Action';
    }
    
    paragraphs.push(`    <Paragraph Type="${currentType}">
      <Text>${escapeXml(trimmedLine)}</Text>
    </Paragraph>`);
  });
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Template="No" Version="5">
  <Content>
${paragraphs.join('\n')}
  </Content>
  <TitlePage>
    <Content>
      <Paragraph Type="Title">
        <Text>${escapeXml(data.title)}</Text>
      </Paragraph>
      ${data.author ? `<Paragraph Type="Author">
        <Text>Written by</Text>
      </Paragraph>
      <Paragraph Type="Author">
        <Text>${escapeXml(data.author)}</Text>
      </Paragraph>` : ''}
    </Content>
  </TitlePage>
</FinalDraft>`;
}

/**
 * Generate HTML for PDF conversion
 * This creates a properly formatted screenplay layout
 */
export function formatAsHtmlForPdf(data: ScriptExportData): string {
  const escapeHtml = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
  
  const processScriptContent = (content: string): string => {
    const lines = content.split('\n');
    let html = '';
    
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        html += '<p class="empty-line">&nbsp;</p>';
        return;
      }
      
      // Scene headings
      if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)/i.test(trimmed)) {
        html += `<p class="scene-heading">${escapeHtml(trimmed.toUpperCase())}</p>`;
      }
      // Character names (all caps, centered for dialogue)
      else if (/^[A-Z][A-Z\s\(\)]+$/.test(trimmed) && trimmed.length < 40) {
        html += `<p class="character">${escapeHtml(trimmed)}</p>`;
      }
      // Parentheticals
      else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        html += `<p class="parenthetical">${escapeHtml(trimmed)}</p>`;
      }
      // Transitions
      else if (/^(CUT TO|FADE|DISSOLVE|SMASH CUT|MATCH CUT)/i.test(trimmed)) {
        html += `<p class="transition">${escapeHtml(trimmed.toUpperCase())}</p>`;
      }
      // Everything else is action or dialogue
      else {
        html += `<p class="action">${escapeHtml(trimmed)}</p>`;
      }
    });
    
    return html;
  };
  
  const scriptHtml = data.fullScript ? processScriptContent(data.fullScript) : '';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(data.title)}</title>
  <style>
    @page {
      size: letter;
      margin: 1in;
    }
    
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12pt;
      line-height: 1;
      max-width: 6in;
      margin: 0 auto;
    }
    
    .title-page {
      text-align: center;
      page-break-after: always;
      padding-top: 3in;
    }
    
    .title {
      font-size: 24pt;
      font-weight: bold;
      margin-bottom: 0.5in;
    }
    
    .author {
      margin-top: 1in;
    }
    
    .scene-heading {
      font-weight: bold;
      margin-top: 24pt;
      margin-bottom: 12pt;
    }
    
    .action {
      margin-top: 12pt;
      margin-bottom: 12pt;
    }
    
    .character {
      margin-left: 2in;
      margin-top: 12pt;
      margin-bottom: 0;
    }
    
    .parenthetical {
      margin-left: 1.5in;
      margin-right: 2in;
      margin-top: 0;
      margin-bottom: 0;
    }
    
    .dialogue {
      margin-left: 1in;
      margin-right: 1.5in;
      margin-top: 0;
      margin-bottom: 12pt;
    }
    
    .transition {
      text-align: right;
      margin-top: 12pt;
      margin-bottom: 12pt;
    }
    
    .empty-line {
      margin: 0;
      height: 12pt;
    }
  </style>
</head>
<body>
  <div class="title-page">
    <div class="title">${escapeHtml(data.title)}</div>
    ${data.author ? `<div class="author">Written by<br><br>${escapeHtml(data.author)}</div>` : ''}
  </div>
  
  <div class="script-content">
    ${scriptHtml}
  </div>
</body>
</html>`;
}

/**
 * Download a file with the given content and filename
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Main export function that handles all formats
 */
export function exportScript(
  data: ScriptExportData,
  format: 'pdf' | 'fountain' | 'txt' | 'fdx'
): void {
  const safeTitle = data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'script';
  
  switch (format) {
    case 'fountain':
      const fountainContent = formatAsFountain(data);
      downloadFile(fountainContent, `${safeTitle}.fountain`, 'text/plain');
      break;
      
    case 'txt':
      const txtContent = formatAsPlainText(data);
      downloadFile(txtContent, `${safeTitle}.txt`, 'text/plain');
      break;
      
    case 'fdx':
      const fdxContent = formatAsFinalDraft(data);
      downloadFile(fdxContent, `${safeTitle}.fdx`, 'application/xml');
      break;
      
    case 'pdf':
      // For PDF, we generate HTML and open it in a new window for printing
      const htmlContent = formatAsHtmlForPdf(data);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        // Fallback: download as HTML
        downloadFile(htmlContent, `${safeTitle}.html`, 'text/html');
      }
      break;
  }
}
