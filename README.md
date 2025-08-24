# Slayout Tools

**Slayout Tools** is a Visual Studio Code extension that provides:

- Syntax highlighting for `.slayout` files (custom shader layout definitions)
- Macro highlighting in `.shader` files
- Hover support for macros, showing per-backend definitions from `macros.json`

---

## Features

- **Syntax Highlighting**
  - Highlights macros in both `.slayout` and `.shader` files
  - Custom scopes defined for macro tokens

- **Hover Tooltip for Macros**
  - Hovering over a macro like `%MY_MACRO` in a `.shader` file shows definitions from `macros.json`
  - Displays backend-specific versions (GLSL, HLSL, SPIR-V, MSL, etc.)
  - Supports directory scanning — finds `macros.json` in sibling folders near the shader file

---

## Folder Structure Example

To enable hover support, your project should contain:
```
project/
├── example/
│ ├── input.shader
| ├── layout.slayout
│ └── outputs/
│   └── macros.json
```

- When you hover over a macro in `my_shader.shader`, the extension will automatically look for `macros.json` in any subfolder of the same directory (like `outputs/`) and use it to populate tooltips.

---

## Macro Format

The `macros.json` file should contain backend-specific definitions per macro name. 
This file is generated automatically when using [this repo](https://github.com/sssarana/slayout), you do not need to do anything extra, just build the shaders at least once.

Example of metadata file:

```json
{
  "LIGHT_BLOCK": {
    "glsl": "uniform Light { vec3 direction; };",
    "hlsl": "cbuffer Light : register(b0) { float3 direction; };",
    "msl": "constant Light& light [[buffer(0)]];",
    "lazy": false
  }
}
```

---

## Requirements
- VS Code v1.100.0 or newer
- macros.json file in an accessible subdirectory for tooltips