"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let macroDefs = {};
function loadMacrosJson(documentPath) {
    const shaderDir = path.dirname(documentPath);
    try {
        const entries = fs.readdirSync(shaderDir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const subDir = path.join(shaderDir, entry.name);
                const macroFile = path.join(subDir, 'macros.json');
                if (fs.existsSync(macroFile)) {
                    const content = fs.readFileSync(macroFile, 'utf-8');
                    const parsed = JSON.parse(content);
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
    }
    catch (err) {
        console.error("Error while loading macros.json:", err);
    }
    macroDefs = {};
    console.warn("No macros.json found in any subdirectory of", shaderDir);
}
function activate(context) {
    const hoverProvider = vscode.languages.registerHoverProvider('shader', {
        provideHover(document, position) {
            loadMacrosJson(document.uri.fsPath);
            const range = document.getWordRangeAtPosition(position, /%[A-Z_][A-Z0-9_]*/);
            if (!range)
                return;
            const word = document.getText(range).substring(1); // remove %
            const macro = macroDefs[word];
            if (!macro) {
                return new vscode.Hover(`Unknown macro: \`${word}\``);
            }
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`**Macro: \`${word}\`**\n\n`);
            for (const [backend, code] of Object.entries(macro)) {
                // Skip non-code fields like "lazy"
                if (typeof code !== 'string')
                    continue;
                md.appendMarkdown(`**${backend}**\n`);
                md.appendCodeblock(code.trim(), backend);
                md.appendMarkdown(`\n---\n`);
            }
            return new vscode.Hover(md);
        }
    });
    context.subscriptions.push(hoverProvider);
}
exports.activate = activate;
