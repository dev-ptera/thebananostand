# TheBananoStand
[![CI](https://github.com/dev-ptera/thebananostand/actions/workflows/ci.yml/badge.svg)](https://github.com/dev-ptera/thebananostand/actions/workflows/ci.yml)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/dev-ptera/thebananostand)
![GitHub Release Date - Published_At](https://img.shields.io/github/release-date/dev-ptera/thebananostand)
![GitHub](https://img.shields.io/github/license/dev-ptera/thebananostand)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fthebananostand.com)

[https://thebananostand.com](https://thebananostand.com/)

## About

TheBananoStand is a web-based [Banano](https://banano.cc/) wallet - manage your favorite digital meme currency with ease!

This project was created to manage funds via the highly secure [Ledger hardware wallets](https://www.ledger.com/), but has been extended to support seeds and mnemonic phrases as well.  

> Note: a ledger device is the recommended way to guarantee there will always be money in the banano stand. 

## Supported Browsers

- Chrome
- Brave
- Edge
- Firefox

> Note: Most Chromium-based browsers will work with this wallet.

## Ledger Usage

Do you already own a ledger device and want to use it to store your Banano?

1.  Visit https://thebananostand.com
2.  Download the Banano Ledger app (>=1.2.6) onto your hardware wallet and open it.  See [Ledger Live](https://www.ledger.com/ledger-live) for details.
3.  Connect your ledger device to your computer via USB.
4.  Click the "Load Ledger" button.

After your ledger is unlocked, you can now send or receive as you please. 

## API Usage

You can send others requests for payment or requests to change representative by adding the following query parameters to your URLs.

Supported query parameters:

| Name    | Description                                                                    |
|---------|--------------------------------------------------------------------------------|
| request | The type of transaction to initiate on load - can either be 'send' or 'change' |
| address | The address to send Banano / change representive to                            |
| amount  | (send only) the amount of Banano to send                                       |

##### Send example
https://thebananostand.com?request=send&address=ban_1z7rxmcwataoqahha6xdo3j1tfikoufkhb95dg4b7aajapa4cnp6h3s9f8oj&amount=.006

##### Change example
https://thebananostand.com?request=change&address=ban_3batmanuenphd7osrez9c45b3uqw9d9u81ne8xa6m43e1py56y9p48ap69zg

## Running Project

Did you clone the project and want to run it on your machine? 

    yarn && yarn start

or

    npm i --legacy-peer-deps && npm run start

## Releases

This project has fully automated [GitHub releases](https://github.com/dev-ptera/thebananostand/releases) which are validated and published via a [GitHub Actions pipeline](https://github.com/dev-ptera/thebananostand/actions).

## Testing

This project uses Cypress for end-to-end testing.  In order to run the Cypress tests, run in terminal 1: `yarn start` & in terminal 2: `yarn cypress`.  

All tests are ran using Electron. 

## Issues / Requests

Is there either something horribly wrong or do you have a cool feature request?  Pick one:

-  [Open an issue](https://github.com/dev-ptera/thebananostand/issues) on GitHub
-  Tag me in the [Banano discord](https://chat.banano.cc/)
-  Send me an email (dev.ptera@gmail.com)

> Note: If you want to contribute to this project, please contact me before implementing a new feature.  We want to make sure it makes sense to add before working on it.
