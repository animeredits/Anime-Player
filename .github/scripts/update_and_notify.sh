#!/bin/bash

# Variables
COMMIT_MESSAGE="Updated Anime Player with latest changes"
BRANCH="main"

# Add all changes
git add .

# Commit changes
git commit -m "$COMMIT_MESSAGE"

# Push changes to the branch
git push origin $BRANCH

echo "Changes pushed to GitHub!"

# Build and publish the app
npm run dist

echo "App built and published!"
