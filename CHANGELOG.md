# Changelog

## v1.0 - First stable version

- This is a breaking change version and reinstallation is recommended (identity used in SDKs and Chat channel member name is now tied to the phone number, API key env variables have been renamed)
- Moved from Capability to Access tokens for Client.js
- Auth Token no longer needed, authentication fully via API keys
- Fixed numerous issues associated with switching between the SMS and Call tabs
- Fixed issue with mute button not working under certain circumstances
- Message compose input field now always retains focus for smoother back and forth messaging experience
- Added support for inbound calls
- Added ability to delete messaging history with a given contact
- Added basic access control using a shared secret

### Upgrade steps from v0.9

- rename env variables in `deploy/.env` from `SYNC_API_KEY` and `SYNC_API_SECRET` to `API_KEY` and `API_SECRET`
- create a new [Chat Service](https://www.twilio.com/console/chat/services) and update CHAT_SERVICE_SID with its SID in `deploy/.env`
- add a SECRET env variable with some shared secret (effectively a password) to `deploy/.env`

## v0.9 - Proof of concept

- Initial version
