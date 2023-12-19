# Change Log

## v4.5.0 (December 19, 2023)

### Added

-  Added receiver alias (if known) to Send transaction workflow.
-  Added copy address button to each entry in the Address Book.
-  Added tooltips to Address Book row actions.

### Fixed 

-  No loading indicator visible when loading an account whose representative is offline.

### Changed

-  Border / divider weight for light themes.

## v4.4.0 (December 8, 2023)

### Added

-  Added option to add custom RPC node on settings page.

## v4.3.0 (September 30, 2023)

### Added

-  Added a formatter to help round BAN balances to less significant digits when balance is higher. 

## v4.2.2 (September 30, 2023)

### Fixed

-  Fixed exchange rate data not populating.

## v4.2.1 (September 12, 2023)

### Fixed

-  Fixed message signing API not supporting multiple-line messages.

## v4.2.0 (September 12, 2023)

### Added

-  Added ability to scan QR codes on a mobile device.

## v4.1.0 (August 14, 2023)

### Changed

-  Updated dependencies to Angular 16.

## v4.0.3 (August 12, 2023)

### Added

-  E2E tests for API Transaction workflow.

## v4.0.2 (August 12, 2023)

### Changed

-  Updated `@bananocoin/bananojs` dependency to `2.10.0`

## v4.0.1 (July 28, 2023)

### Fixed

-  Fixed message signing not reading value from query parameter.

## v4.0.0 (July 28, 2023)

### Added

-  Added `signmessage` page for deep-link external message-signing actions.

### Changed

-  Updated angular dependencies

### Deleted

-  Dropped Ledger support for Firefox due to U2F deprecation

## v3.9.2 (June 13, 2023)

### Added 

-  Fixed styles and updated messages in the `signing` page.

## v3.9.1 (June 12, 2023)

### Added 

-  Added `signing` page instructions to README

## v3.9.0 (June 9, 2023)

### Added 

-  Added `signing` page for signing or verifying messages using your private key & also for signing blocks without broadcasting them.
-  Added query parameter API for `send` or `change` actions.

## v3.8.2 (June 5, 2023)

### Changed

-  Preserve original route on page refresh.

## v3.8.1 (May 29, 2023)

### Changed

-  Changed copy seed and copy mnemonic options from 'click' event to 'long-press'.

## v3.8.0 (May 17, 2023)

### Added

-  Automatically log out idle users after 15 minutes of inactivity.
 
## v3.7.0 (Apr 2, 2023)

### Added

-  Added ledger support for Firefox desktop browser.

## v3.6.5 (Mar 18, 2023)

### Changed

-  Dashboard card styles.
-  Mobile style changes.
-  Theme adjustments

## v3.6.4 (Mar 15, 2023)

### Changed

-  Refactored e2e tests
-  Dashboard card elevation.

## v3.6.3 (Mar 15, 2023)

### Changed

-  Changed dashboard banner gradient.
-  Change toolbar styles.

## v3.6.2 (Mar 12, 2023)

### Added

-  Added more end-to-end tests.

### Changed

-  Updated the README.

## v3.6.1 (Mar 5, 2023)

### Changed

-  Changed default theme to Green.
-  Default dashboard view for mobile devices will be 'card' & desktop will be 'table'.
-  Changed account scroll container max height on desktop.

## v3.6.0 (Feb 24, 2023)

### Added

-   Added minimum receivable Banano threshold on Settings page. Users can now ignore small incoming transactions. Defaults to 0.
-   Added representative offline indicator on dashboard table view. 

## v3.5.1 (Feb 19, 2023)

### Changed 

-   Made dashboard 1350px wide.

### Fixed

-   Dashboard preference persisted in Localstorage.

## v3.5.0 (Feb 17, 2023)

### Added

-   Added an alternative table view option on Dashboard.

## v3.4.2 (Feb 9, 2023)

### Changed

-   Refresh known accounts, online reps, and price data on Dashboard refresh.

### Fixed

-   Fixed conversion pipe not updating on price changes.

## v3.4.1 (Feb 6, 2023)

### Added

-   Added a spinner next to total wallet balance when loading accounts.

### Changed

-   Changed "Unopened Account" text size on Dashboard.

### Fixed

-   Fixed bug where unauthenticated users can access the Settings and Address Book pages.

## v3.4.0 (Feb 5, 2023)

### Changed

-   Changed Dashboard desktop and mobile layouts.

## v3.3.0 (Feb 4, 2023)

### Added

-   Added option to Receive All incoming transactions from the Dashboard page.

## v3.2.0 (Feb 4, 2023)

### Added

-   Add currency localization options on settings page.
-   Add localization price conversions on Send overlays.

## v3.1.0 (Jan 31, 2023)

### Added

-   Add basic address book page, with ability to import from Banano Vault and export to JSON.

## v3.0.0 (Jan 12, 2023)

### Changed

-   Update to use Angular 15 dependencies
-   Rework Dashboard UI (desktop / mobile) and Accounts (mobile) screens.

## v2.0.0 (Jan 7, 2023)

### Added

-   Proof-of-work (PoW) racing between client and server.

### Changed

-   Update to use Angular 14 dependencies
-   Use a global store and introduce wallet events service.


## v1.0.0 (Dec 7, 2022)

First tag, stable version released.
