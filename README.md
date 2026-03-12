# Facebook Message Deleter

Bulk-delete your Facebook Messenger conversations from the browser console. No extensions, no installs - just paste and go.

## Quick Start

1. Open [facebook.com/messages](https://www.facebook.com/messages) in your browser.
2. Press `Ctrl + Shift + J` (Windows/Linux) or `Cmd + Option + J` (Mac) to open the console.
3. Paste the contents of `delete_messages.js` and press Enter.

The script will show a blue status bar at the top of the page with a STOP button. It deletes up to 50 conversations per run to avoid Facebook rate-limiting.

You can also copy the script directly from the [GitHub Pages site](https://dandanilyuk.github.io/facebook_message_deleter/).

## How It Works

The script clicks through each conversation's menu, selects "Delete", and confirms the dialog - the same steps you'd do manually, just automated. It waits for Facebook to lazy-load more conversations before finishing.

## Disclaimer

This script is provided as-is and is not affiliated with Facebook. Use at your own risk.
