# Monetization and payment plan

## AGPL boundary
This derivative includes code derived from Mica for Zotero and is distributed under AGPL terms. AGPL section 10 prohibits further restrictions on rights granted by the license. Section 4 permits charging for conveyed copies, but recipients retain the license rights. Do not add a license-key gate that disables bundled themes. This is a product/licensing assessment, not legal advice.

Decision: all 12 bundled themes remain available to everyone. No payment SDK, license key, activation server, telemetry, or theme lock is included.

## Recommended US$1 option
Use a voluntary one-time GitHub Sponsors tier such as “TAIS Supporter — US$1 one-time”. Benefits can be acknowledgement, release notes, or supporter recognition, not exclusive control over AGPL-covered functionality. GitHub Sponsors requires an approved profile, 2FA, tax details, and a payout method. Current GitHub documentation says personal-account sponsorships have no GitHub fee; organization sponsorships may incur up to 6%. Payout is to an eligible bank account or fiscal host, not directly to an Alipay wallet.

## Alipay
Alipay may be an additional voluntary payment option for users in China if the maintainer has a verified merchant product and compliant settlement account. For overseas merchants, official Alipay materials describe cross-border acquiring through overseas acquirers/merchants and Alipay+ payment rails. This is not equivalent to a personal QR code providing global checkout and settlement. Eligibility, settlement currency, refunds, chargebacks, tax and KYC depend on the acquiring partner and merchant location.

Do not embed a personal QR code or payment credentials in the plugin. Once a verified merchant checkout URL exists, add it to the website or repository funding page. Never collect payment credentials inside Zotero.

## Required before accepting money
1. Confirm legal payee, country of tax residence, and settlement-bank country.
2. Complete GitHub Sponsors onboarding or apply with a fiscal host.
3. For Alipay, contact an authorized acquiring partner and obtain a merchant agreement and hosted checkout.
4. Publish refund, support, privacy, tax, and contact policies.
5. Test a live transaction, refund, webhook signature, duplicate notification handling, and settlement.
6. Keep payment processing outside the Zotero plugin.

## Official references
- https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors
- https://docs.github.com/en/sponsors/receiving-sponsorships-through-github-sponsors/setting-up-github-sponsors-for-your-personal-account
- https://idocs.alipay.com/alipayplus-handbook/alipay/en
- https://www.gnu.org/licenses/agpl-3.0.html
