.PHONY: build test fmt lint typecheck version version-next release install-tools hooks clean

build:
	npm run build

test:
	npm test

fmt:
	npx prettier --write .

typecheck:
	npx tsc --noEmit

lint: fmt typecheck

version:
	@node -p "require('./package.json').version"

version-next:
	@echo "Use: npm version [patch|minor|major] --no-git-tag-version"

release:
	@echo "Use: npm version <patch|minor|major>, then git push origin v<version>"

install-tools:
	npm install
	@command -v lefthook >/dev/null 2>&1 || npm install -g lefthook

hooks:
	lefthook install

clean:
	rm -rf build coverage
