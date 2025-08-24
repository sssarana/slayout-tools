import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let macroDefs: Record<string, Record<string, string>> = {};

function loadMacrosJson(workspaceRoot: string) {
  const macroFile = path.join(workspaceRoot, 'macros.json');
  if (fs.existsSync(macroFile)) {
    const content = fs.readFileSync(macroFile, 'utf-8');
    try {
      macroDefs = JSON.parse(content);
    } catch (err) {
      console.error("Failed to parse macros.json", err);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  const root = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (root) loadMacrosJson(root);

  const hoverProvider = vscode.languages.registerHoverProvider('shader', {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position, /%[A-Z_][A-Z0-9_]*/);
      if (!range) return;

      const word = document.getText(range).substring(1); // drop %
      if (macroDefs[word]) {
        const defs = macroDefs[word];
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`**Macro: \`${word}\`**\n\n`);
        for (const [backend, code] of Object.entries(defs)) {
          md.appendCodeblock(code.trim(), backend);
        }
        return new vscode.Hover(md);
      }

      return new vscode.Hover(`Unknown macro: \`${word}\``);
    }
  });

  context.subscriptions.push(hoverProvider);
}
