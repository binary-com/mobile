#TickTrade 2

##How to use code-push to push new version

1. Install code-push
2. Modify `www/versions.json` file and add details of new version on it.
2. Use gulp to push the release

  `$gulp code-push --app <registered appName in code-push> --deployment <deploymentName> --platform <[android, ios]>`

