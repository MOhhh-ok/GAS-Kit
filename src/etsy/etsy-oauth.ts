class EtsyOAuth {
    apiKey: string;

    constructor() {
        this.apiKey = PropertiesService.getScriptProperties().getProperty('ETSY_API_KEY') || '';
    }

    getCallbackUrl() {
        return this.getService().getRedirectUri();
    }

    getService() {
        const scopes = ['listings_r'];

        this.pkceChallengeVerifier();
        const prop = PropertiesService.getUserProperties();

        console.log('https://api.etsy.com/v3/public/oauth/token?code_verifier=' + prop.getProperty('code_verifier'));

        return OAuth2.createService('etsy')

            // Set the endpoint URLs
            .setAuthorizationBaseUrl('https://www.etsy.com/oauth/connect')
            .setTokenUrl('https://api.etsy.com/v3/public/oauth/token?code_verifier=' + prop.getProperty('code_verifier'))

            .setClientId(this.apiKey)
            .setCallbackFunction('EtsyAuthCallback')

            .setPropertyStore(prop)

            .setScope(scopes.join(' '))

            .setParam('response_type', 'code')

            // Consent prompt is required to ensure a refresh token is always
            // returned when requesting offline access.
            .setParam('prompt', 'consent')

            // Challenge
            .setParam('code_challenge_method', 'S256')
            .setParam('code_challenge', prop.getProperty("code_challenge"))
    }

    auth() {
        const service = this.getService();
        if (!service.hasAccess()) {
            const authorizationUrl = service.getAuthorizationUrl();
            const template = HtmlService.createTemplate(
                '<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
                'Reopen the sidebar when the authorization is complete.');
            template.authorizationUrl = authorizationUrl;
            const page = template.evaluate();
            SpreadsheetApp.getUi().showModalDialog(page, "auth");
        } else {
            // ...
        }
    }

    reset(){
        const service=this.getService();
        service.reset();
    }

    pkceChallengeVerifier() {
        const prop = PropertiesService.getUserProperties();
        if (!prop.getProperty("code_verifier")) {
            let verifier = "";
            const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

            for (let i = 0; i < 128; i++) {
                verifier += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            const sha256Hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, verifier)

            const challenge = Utilities.base64Encode(sha256Hash)
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '')
            prop.setProperty("code_verifier", verifier)
            prop.setProperty("code_challenge", challenge)
        }
    }
}

function EtsyAuthCallback(request: { [key: string]: any }) {
    const oauth = new EtsyOAuth();
    var service = oauth.getService();

    //回避：Error: Error retrieving token: invalid_request, code_verifier is required（行 605、ファイル「Service」）
    request.parameter.codeVerifier_ = PropertiesService.getUserProperties().getProperty('code_verifier');

    console.log(request);
    var isAuthorized = service.handleCallback(request);
    console.log(isAuthorized);
    if (isAuthorized) {
        return HtmlService.createHtmlOutput('Success! You can close this tab.');
    } else {
        return HtmlService.createHtmlOutput('Denied. You can close this tab');
    }
}