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
function loadMacrosJson(workspaceRoot) {
    const macroFile = path.join(workspaceRoot, 'macros.json');
    if (fs.existsSync(macroFile)) {
        const content = fs.readFileSync(macroFile, 'utf-8');
        try {
            macroDefs = JSON.parse(content);
        }
        catch (err) {
            console.error("Failed to parse macros.json", err);
        }
    }
}
function activate(context) {
    var _a, _b;
    const root = (_b = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.uri.fsPath;
    if (root)
        loadMacrosJson(root);
    const hoverProvider = vscode.languages.registerHoverProvider('shader', {
        provideHover(document, position) {
            const range = document.getWordRangeAtPosition(position, /%[A-Z_][A-Z0-9_]*/);
            if (!range)
                return;
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
exports.activate = activate;
