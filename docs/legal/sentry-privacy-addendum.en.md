# Error reporting — text for the next privacy policy revision

**Draft. Not yet effective.** Merge this section into the published privacy policy only for the release that actually enables Sentry, after verifying the project region, retention and service configuration. The currently distributed build does not report to Sentry. This text does not replace the data controller and contact section.

## Optional error reporting

You can choose to send JavaScript error reports to Sentry to help us find and fix app problems. Reporting is off by default. You can enable it by saving the preference in settings or by explicitly accepting the prompt after a handled app error. The prompt explains that your choice covers that error and future reports. Nothing is sent before your choice is saved. Declining or dismissing the prompt keeps reporting off, and we remember your decision so that the same prompt does not keep appearing. You can change your choice in settings.

Reports contain the error category, code positions, app version and build, Android version, and an event identifier and timestamp. Original error messages, arbitrary file paths and function names are removed. We do not include sketch names or content, measurements, notes, camera images, local measurement logs, purchase tokens or user identifiers. We do not record sessions or collect activity history through this feature. Native Android crashes are not included in this integration.

Sentry, operated by Functional Software, Inc., processes reports on our behalf. The selected storage region for events is the EU. Some service account and organisation metadata may still be processed in the United States. Applicable processing terms and transfer safeguards govern that processing. See [Sentry's privacy information](https://sentry.io/privacy/) and [data processing addendum](https://sentry.io/legal/dpa/).

Our legal basis for this optional reporting is your consent. You can withdraw it by disabling error reporting and saving settings, without losing access to app features. This stops future reports and cancels pending requests. It does not recall reports already received by Sentry. The integration does not keep an on-disk queue of reports.

We configure the SDK not to include your IP address in event data. Sentry still receives the connection's IP address when delivering reports. Event retention is at most 30 days. **Verify both service-side IP handling and this retention limit before publishing this wording or activating reporting.**

For questions or to exercise your data protection rights, use the contact details in the policy. Because reports do not carry a user account identifier, we may need additional information to locate a particular report, where identification is possible. You do not have to enable reporting to use outlineGo.
