# ============================================
# KeratoVision — Release Build System
# ============================================
# Usage:
#   make all            — Build all packages
#   make chrome         — Package Chrome extension (.zip)
#   make firefox        — Package Firefox extension (.zip)
#   make vscode         — Package VS Code theme (.vsix)
#   make clean          — Remove all build artifacts
#   make version        — Show current version
#   make validate       — Validate manifests
#   make bump-patch     — 1.0.0 → 1.0.1
#   make bump-minor     — 1.0.0 → 1.1.0
#   make bump-major     — 1.0.0 → 2.0.0
#   make release-patch  — bump-patch + all
#   make release-minor  — bump-minor + all
#   make release-major  — bump-major + all
# ============================================

# Read version dynamically from Chrome manifest (single source of truth)
VERSION := $(shell python3 -c "import json; print(json.load(open('chrome/manifest.json'))['version'])" 2>/dev/null || echo '0.0.0')
DIST_DIR    := dist
CHROME_DIR  := chrome
FIREFOX_DIR := firefox
VSCODE_DIR  := vscode-theme

CHROME_ZIP  := $(DIST_DIR)/keratovision-chrome-v$(VERSION).zip
FIREFOX_ZIP := $(DIST_DIR)/keratovision-firefox-v$(VERSION).zip
VSCODE_VSIX := $(DIST_DIR)/keratovision-theme-$(VERSION).vsix

# Colors for terminal output
GREEN  := \033[0;32m
CYAN   := \033[0;36m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m # No Color
BOLD   := \033[1m

# ============================================
#  TARGETS
# ============================================

.PHONY: all chrome firefox vscode clean validate version help \
        bump-patch bump-minor bump-major release-patch release-minor release-major \
        github-release publish-patch publish-minor publish-major

all: clean validate chrome firefox vscode
	@echo ""
	@echo "$(GREEN)$(BOLD)✅ All packages built successfully!$(NC)"
	@echo ""
	@ls -lh $(DIST_DIR)/
	@echo ""
	@echo "$(CYAN)Release artifacts in $(DIST_DIR)/:$(NC)"
	@echo "  📦 Chrome:  $(CHROME_ZIP)"
	@echo "  🦊 Firefox: $(FIREFOX_ZIP)"
	@echo "  🎨 VS Code: $(VSCODE_VSIX)"

# ============================================
#  CHROME EXTENSION
# ============================================

chrome: $(CHROME_ZIP)

$(CHROME_ZIP): $(DIST_DIR)
	@echo "$(CYAN)📦 Packaging Chrome extension...$(NC)"
	@cd $(CHROME_DIR) && zip -r -q ../$(CHROME_ZIP) . \
		-x ".*" \
		-x "__MACOSX/*" \
		-x "*.DS_Store"
	@echo "$(GREEN)  ✓ $(CHROME_ZIP) ($(shell du -h $(CHROME_ZIP) 2>/dev/null | cut -f1 || echo 'done'))$(NC)"

# ============================================
#  FIREFOX EXTENSION
# ============================================

firefox: $(FIREFOX_ZIP)

$(FIREFOX_ZIP): $(DIST_DIR)
	@echo "$(CYAN)🦊 Packaging Firefox extension...$(NC)"
	@cd $(FIREFOX_DIR) && zip -r -q ../$(FIREFOX_ZIP) . \
		-x ".*" \
		-x "__MACOSX/*" \
		-x "*.DS_Store"
	@echo "$(GREEN)  ✓ $(FIREFOX_ZIP) ($(shell du -h $(FIREFOX_ZIP) 2>/dev/null | cut -f1 || echo 'done'))$(NC)"

# ============================================
#  VS CODE THEME
# ============================================

vscode: $(VSCODE_VSIX)

$(VSCODE_VSIX): $(DIST_DIR)
	@echo "$(CYAN)🎨 Packaging VS Code theme...$(NC)"
	@cd $(VSCODE_DIR) && npm install --silent 2>/dev/null && npx tsc -p ./ 2>/dev/null
	@cd $(VSCODE_DIR) && npx -y @vscode/vsce package --no-dependencies --allow-missing-repository && \
		mv keratovision-theme-$(VERSION).vsix ../$(VSCODE_VSIX) || \
		(echo "$(YELLOW)  ⚠ vsce failed, falling back to manual zip$(NC)" && \
		 cd ../$(VSCODE_DIR) && zip -r -q ../$(VSCODE_VSIX) out/ themes/ package.json README.md LICENSE icon.png \
			-x "*.DS_Store")
	@echo "$(GREEN)  ✓ $(VSCODE_VSIX) ($(shell du -h $(VSCODE_VSIX) 2>/dev/null | cut -f1 || echo 'done'))$(NC)"

# ============================================
#  VALIDATION
# ============================================

validate:
	@echo "$(CYAN)🔍 Validating manifests...$(NC)"
	@# Chrome manifest
	@if [ ! -f $(CHROME_DIR)/manifest.json ]; then \
		echo "$(RED)  ✗ Chrome manifest.json not found$(NC)"; exit 1; \
	fi
	@python3 -c "import json; json.load(open('$(CHROME_DIR)/manifest.json'))" 2>/dev/null && \
		echo "$(GREEN)  ✓ Chrome manifest.json — valid JSON$(NC)" || \
		(echo "$(RED)  ✗ Chrome manifest.json — invalid JSON$(NC)"; exit 1)
	@# Firefox manifest
	@if [ ! -f $(FIREFOX_DIR)/manifest.json ]; then \
		echo "$(RED)  ✗ Firefox manifest.json not found$(NC)"; exit 1; \
	fi
	@python3 -c "import json; json.load(open('$(FIREFOX_DIR)/manifest.json'))" 2>/dev/null && \
		echo "$(GREEN)  ✓ Firefox manifest.json — valid JSON$(NC)" || \
		(echo "$(RED)  ✗ Firefox manifest.json — invalid JSON$(NC)"; exit 1)
	@# VS Code package.json
	@if [ ! -f $(VSCODE_DIR)/package.json ]; then \
		echo "$(RED)  ✗ VS Code package.json not found$(NC)"; exit 1; \
	fi
	@python3 -c "import json; json.load(open('$(VSCODE_DIR)/package.json'))" 2>/dev/null && \
		echo "$(GREEN)  ✓ VS Code package.json — valid JSON$(NC)" || \
		(echo "$(RED)  ✗ VS Code package.json — invalid JSON$(NC)"; exit 1)
	@# Theme files
	@for theme in $(VSCODE_DIR)/themes/*.json; do \
		python3 -c "import json; json.load(open('$$theme'))" 2>/dev/null && \
			echo "$(GREEN)  ✓ $$(basename $$theme) — valid JSON$(NC)" || \
			(echo "$(RED)  ✗ $$(basename $$theme) — invalid JSON$(NC)"; exit 1); \
	done
	@# File count check
	@echo ""
	@echo "$(CYAN)📊 File counts:$(NC)"
	@echo "  Chrome:  $$(find $(CHROME_DIR) -type f | wc -l | tr -d ' ') files"
	@echo "  Firefox: $$(find $(FIREFOX_DIR) -type f | wc -l | tr -d ' ') files"
	@echo "  VS Code: $$(find $(VSCODE_DIR) -type f -not -path '*/node_modules/*' | wc -l | tr -d ' ') files"

# ============================================
#  UTILITIES
# ============================================

$(DIST_DIR):
	@mkdir -p $(DIST_DIR)

clean:
	@echo "$(YELLOW)🗑  Cleaning build artifacts...$(NC)"
	@rm -rf $(DIST_DIR)
	@echo "$(GREEN)  ✓ Clean$(NC)"

version:
	@echo "$(BOLD)KeratoVision v$(VERSION)$(NC)"
	@echo ""
	@echo "  Chrome:  $$(python3 -c "import json; print(json.load(open('$(CHROME_DIR)/manifest.json'))['version'])" 2>/dev/null || echo 'N/A')"
	@echo "  Firefox: $$(python3 -c "import json; print(json.load(open('$(FIREFOX_DIR)/manifest.json'))['version'])" 2>/dev/null || echo 'N/A')"
	@echo "  VS Code: $$(python3 -c "import json; print(json.load(open('$(VSCODE_DIR)/package.json'))['version'])" 2>/dev/null || echo 'N/A')"

# ============================================
#  SEMVER BUMPING
# ============================================

# Internal: bump version across all manifests
# Usage: $(call _bump,PART) where PART = major | minor | patch
define _bump_version
	@OLD_VER=$$(python3 -c "import json; print(json.load(open('$(CHROME_DIR)/manifest.json'))['version'])"); \
	MAJOR=$$(echo $$OLD_VER | cut -d. -f1); \
	MINOR=$$(echo $$OLD_VER | cut -d. -f2); \
	PATCH=$$(echo $$OLD_VER | cut -d. -f3); \
	case "$(1)" in \
		major) MAJOR=$$((MAJOR + 1)); MINOR=0; PATCH=0 ;; \
		minor) MINOR=$$((MINOR + 1)); PATCH=0 ;; \
		patch) PATCH=$$((PATCH + 1)) ;; \
	esac; \
	NEW_VER="$$MAJOR.$$MINOR.$$PATCH"; \
	echo "$(CYAN)🔖 Bumping $(1): $$OLD_VER → $$NEW_VER$(NC)"; \
	for f in $(CHROME_DIR)/manifest.json $(FIREFOX_DIR)/manifest.json $(VSCODE_DIR)/package.json; do \
		sed -i '' "s/\"version\": \"$$OLD_VER\"/\"version\": \"$$NEW_VER\"/" "$$f"; \
		echo "$(GREEN)  ✓ $$f → v$$NEW_VER$(NC)"; \
	done; \
	echo "$(GREEN)  ✅ All manifests updated to v$$NEW_VER$(NC)"
endef

bump-patch:
	$(call _bump_version,patch)

bump-minor:
	$(call _bump_version,minor)

bump-major:
	$(call _bump_version,major)

# ============================================
#  RELEASE SHORTCUTS (bump + build)
# ============================================

release-patch: bump-patch all
release-minor: bump-minor all
release-major: bump-major all

# ============================================
#  GITHUB RELEASE
# ============================================

github-release: all
	@echo "$(CYAN)🚀 Creating GitHub Release v$(VERSION)...$(NC)"
	@# Check gh auth
	@gh auth status >/dev/null 2>&1 || \
		(echo "$(RED)  ✗ GitHub CLI not authenticated. Run: gh auth login$(NC)" && exit 1)
	@git add -A
	@git commit -m "release: v$(VERSION)" || true
	@# Create/recreate tag
	@git tag -f -a "v$(VERSION)" -m "KeratoVision v$(VERSION)"
	@git push origin main --tags --force
	@echo "$(CYAN)  📦 Uploading release artifacts...$(NC)"
	@# Delete existing release if present, then create new one
	@gh release delete "v$(VERSION)" --yes 2>/dev/null || true
	@# Write release notes to temp file
	@printf '## 📦 Downloads\n\n' > /tmp/kv-release-notes.md
	@printf '| Package | File |\n' >> /tmp/kv-release-notes.md
	@printf '|---------|------|\n' >> /tmp/kv-release-notes.md
	@printf '| Chrome Extension | `keratovision-chrome-v$(VERSION).zip` |\n' >> /tmp/kv-release-notes.md
	@printf '| Firefox Add-on | `keratovision-firefox-v$(VERSION).zip` |\n' >> /tmp/kv-release-notes.md
	@printf '| VS Code Theme | `keratovision-theme-$(VERSION).vsix` |\n\n' >> /tmp/kv-release-notes.md
	@printf '### Install\n\n' >> /tmp/kv-release-notes.md
	@printf '**Chrome:** Settings → Extensions → Load unpacked → select extracted zip\n\n' >> /tmp/kv-release-notes.md
	@printf '**Firefox:** `about:debugging` → Load Temporary Add-on → select manifest.json\n\n' >> /tmp/kv-release-notes.md
	@printf '**VS Code:** `code --install-extension keratovision-theme-$(VERSION).vsix`\n' >> /tmp/kv-release-notes.md
	@gh release create "v$(VERSION)" \
		$(CHROME_ZIP) \
		$(FIREFOX_ZIP) \
		$(VSCODE_VSIX) \
		--title "KeratoVision v$(VERSION)" \
		--notes-file /tmp/kv-release-notes.md
	@rm -f /tmp/kv-release-notes.md
	@echo ""
	@echo "$(GREEN)$(BOLD)✅ Released v$(VERSION) on GitHub!$(NC)"
	@echo "$(CYAN)  🔗 https://github.com/r1z4x/KeratoVision/releases/tag/v$(VERSION)$(NC)"

# One-step: bump + build + GitHub release
publish-patch: bump-patch github-release
publish-minor: bump-minor github-release
publish-major: bump-major github-release

# ============================================
#  HELP
# ============================================

help:
	@echo ""
	@echo "$(BOLD)KeratoVision Build System$(NC)"
	@echo "========================"
	@echo ""
	@echo "  $(BOLD)Build:$(NC)"
	@echo "  $(CYAN)make all$(NC)            Build all release packages"
	@echo "  $(CYAN)make chrome$(NC)         Package Chrome extension (.zip)"
	@echo "  $(CYAN)make firefox$(NC)        Package Firefox extension (.zip)"
	@echo "  $(CYAN)make vscode$(NC)         Package VS Code theme (.vsix)"
	@echo ""
	@echo "  $(BOLD)Version:$(NC)"
	@echo "  $(CYAN)make bump-patch$(NC)     Increment patch  (1.0.0 → 1.0.1)"
	@echo "  $(CYAN)make bump-minor$(NC)     Increment minor  (1.0.0 → 1.1.0)"
	@echo "  $(CYAN)make bump-major$(NC)     Increment major  (1.0.0 → 2.0.0)"
	@echo "  $(CYAN)make release-patch$(NC)  Bump patch + build all"
	@echo "  $(CYAN)make release-minor$(NC)  Bump minor + build all"
	@echo "  $(CYAN)make release-major$(NC)  Bump major + build all"
	@echo "  $(BOLD)Publish (bump + build + GitHub release):$(NC)"
	@echo "  $(CYAN)make publish-patch$(NC)   1.0.0 → 1.0.1 + release"
	@echo "  $(CYAN)make publish-minor$(NC)   1.0.0 → 1.1.0 + release"
	@echo "  $(CYAN)make publish-major$(NC)   1.0.0 → 2.0.0 + release"
	@echo "  $(CYAN)make github-release$(NC)  Build + create GitHub release"
	@echo "  $(CYAN)make version$(NC)         Show current version"
	@echo ""
	@echo "  $(BOLD)Utils:$(NC)"
	@echo "  $(CYAN)make validate$(NC)        Validate all manifest files"
	@echo "  $(CYAN)make clean$(NC)           Remove build artifacts"
	@echo ""
