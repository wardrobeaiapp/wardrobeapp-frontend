# Steps to Remove Secrets from Git History

## Option 1: Using git filter-branch (Native Git)

```bash
# Create a backup of your repository first
cp -r wardrobe-app wardrobe-app-backup

# Remove .env files from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env server/.env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push the changes
git push origin --force
```

## Option 2: Using BFG Repo Cleaner (Faster alternative)

```bash
# Install BFG (on macOS with Homebrew)
brew install bfg

# Create a clone of your repo (bare)
git clone --mirror https://github.com/wardrobeaiapp/wardrobeapp-frontend.git

# Run BFG to remove the files
bfg --delete-files .env wardrobeapp-frontend.git
bfg --delete-files server/.env wardrobeapp-frontend.git

# Clean and push
cd wardrobeapp-frontend.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

## After removing secrets

1. Revoke the exposed Anthropic API key immediately and generate a new one
2. Update your local .env files with the new API key
3. Verify the sensitive data is no longer in the repository
4. Make sure all team members pull the latest changes and update their local copies
