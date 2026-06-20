# Linting & Formatting Setup (ESLint + Prettier)

This document covers the ESLint and Prettier configuration added to `music_app/`,
why each piece exists, and how to use it day to day.

---

## 1. ESLint — `eslint.config.js`

Location: `music_app/eslint.config.js`

## 2. Prettier — `.prettierrc` and `.prettierignore`

Use to format code. Our local settings.json will use our music_app.prettierrc to format
the documents.

## 3. Example Commands

Run these from inside `music_app/`:

```bash
yarn format
yarn lint:fix
```

## 4. Adding Dev Dependencies with Yarn

Dev dependencies are tools used during development (linting, formatting, build
tooling) but not shipped in the production app. Install them with `--dev`:

```bash
yarn add --dev <package-name>
```

Example — packages added as part of this setup:

```bash
yarn add --dev eslint-config-prettier
```

(`prettier` itself was already in your `devDependencies`.)

This updates `package.json`'s `devDependencies` block and `yarn.lock`
automatically. To remove one later:

```bash
yarn remove <package-name>
```

**Order of operations on save:** Prettier formats first → ESLint autofix runs second.

Required VS Code extensions:

- `dbaeumer.vscode-eslint` (ESLint)
- `esbenp.prettier-vscode` (Prettier)
