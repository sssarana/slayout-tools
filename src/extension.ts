import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let macroDefs: Record<string, Record<string, any>> = {};

function loadMacrosJson(documentPath: string) {
  const shaderDir = path.dirname(documentPath);

  try {
    const entries = fs.readdirSync(shaderDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path.join(shaderDir, entry.name);
        const macroFile = path.join(subDir, 'macros.json');

        if (fs.existsSync(macroFile)) {
          const content = fs.readFileSync(macroFile, 'utf-8');
          const parsed = JSON.parse(content) as Record<string, Record<string, any>>;

          macroDefs = {}; // clear old ones
          for (const [macro, defs] of Object.entries(parsed)) {
            if (typeof defs === 'object' && defs !== null) {
              macroDefs[macro.toUpperCase()] = defs;
            }
          }

          console.log("Loaded macros.json from:", macroFile);
          return;
        }
      }
    }
  } catch (err) {
    console.error("Error while loading macros.json:", err);
  }

  macroDefs = {};
  console.warn("No macros.json found in any subdirectory of", shaderDir);
}

export function activate(context: vscode.ExtensionContext) {
  const hoverProvider = vscode.languages.registerHoverProvider('shader', {
    provideHover(document, position) {
	  loadMacrosJson(document.uri.fsPath);
      const range = document.getWordRangeAtPosition(position, /%[A-Z_][A-Z0-9_]*/);
      if (!range) return;

      const word = document.getText(range).substring(1); // remove %
      const macro = macroDefs[word];
      if (!macro) {
        return new vscode.Hover(`Unknown macro: \`${word}\``);
      }

      const md = new vscode.MarkdownString();
      md.appendMarkdown(`**Macro: \`${word}\`**\n\n`);

      for (const [backend, code] of Object.entries(macro)) {
        // Skip non-code fields like "lazy"
        if (typeof code !== 'string') continue;
		md.appendMarkdown(`**${backend}**\n`);
        md.appendCodeblock(code.trim(), backend);
		md.appendMarkdown(`\n---\n`);
      }

      return new vscode.Hover(md);
    }
  });

  context.subscriptions.push(hoverProvider);
}
