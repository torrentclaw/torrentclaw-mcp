.PHONY: build test fmt lint typecheck version release release-minor release-major install clean

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

release:
	npm run release
	@echo "Run: git push --follow-tags origin main"

release-minor:
	npm run release:minor
	@echo "Run: git push --follow-tags origin main"

release-major:
	npm run release:major
	@echo "Run: git push --follow-tags origin main"

install:
	npm install

clean:
	rm -rf build coverage
