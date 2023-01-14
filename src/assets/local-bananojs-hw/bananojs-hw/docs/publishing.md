## to check for outdated deps

    npm install package@latest;

## to publish a new version

    npm run preflight;

    npm --no-git-tag-version version patch;npm run browserify;

    git commit -a -m 'updating dependencies';
    git pull;
    git push;

    npm publish --access public;

## to publish documentation

    docs on how to make docs here:
    <https://github.com/documentationjs/documentation#readme>
