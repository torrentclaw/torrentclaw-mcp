# Contributing to torrentclaw-mcp

Thanks for your interest in contributing! Here's how you can help.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-user>/torrentclaw-mcp.git`
3. Install dev tools and git hooks:
   ```bash
   make install-tools
   make hooks
   ```
4. Create a branch: `git checkout -b feat/my-feature`
5. Make your changes
6. Test locally: `make build && make test`
7. Commit with a clear message (see below) — the commit-msg hook will validate the format
8. Push and open a Pull Request

## Requirements

- Node.js 18+
- npm
- [lefthook](https://github.com/evilmartians/lefthook) (installed via `make install-tools`)

## Commit Messages

Commits are validated automatically by a git hook. We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope][!]: <description>
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

Examples:

```
feat: add new audio codec detection
fix(scanner): correct HDR10 detection for MKV files
docs: update README examples
refactor: simplify piece selection logic
feat!: redesign output format
```

## Code Style

- Run `npx prettier --write .` before committing (or `make fmt`)
- TypeScript strict mode is enabled
- Keep functions focused and small
- Add comments only where the logic isn't self-evident

## Reporting Bugs

Open an issue with:

- What you expected to happen
- What actually happened
- Steps to reproduce
- Your Node.js version and OS

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
