"use strict";
class YoutubeAnalytics {
    constructor() {
        const prop = PropertiesService.getScriptProperties();
        this.service = OAuth2.createService('youtubeAnalytics')
            .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
            .setTokenUrl('https://accounts.google.com/o/oauth2/token')
            .setClientId(prop.getProperty('GOOGLE_CLIENT_ID'))
            .setClientSecret(prop.getProperty('GOOGLE_CLIENT_SECRET'))
            .setCallbackFunction('ytAnalyticsAuthCallback')
            .setPropertyStore(PropertiesService.getUserProperties())
            // Set the scopes to request (space-separated for Google services).
            .setScope([
            'https://www.googleapis.com/auth/yt-analytics.readonly',
            'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtubepartner'
        ].join(' '))
            // Below are Google-specific OAuth2 parameters.
            // Sets the login hint, which will prevent the account chooser screen
            // from being shown to users logged in with multiple accounts.
            .setParam('login_hint', Session.getEffectiveUser().getEmail());
        // Requests offline access.
        //.setParam('access_type', 'offline')
        // Consent prompt is required to ensure a refresh token is always
        // returned when requesting offline access.
        //.setParam('prompt', 'consent');
    }
    hasAccess() {
        return this.service.hasAccess();
    }
    logout() {
        this.service.reset();
    }
    showDialog() {
        const template = HtmlService.createTemplate('<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
            'Reopen the sidebar when the authorization is complete.');
        template.authorizationUrl = this.service.getAuthorizationUrl();
        SpreadsheetApp.getUi().showModalDialog(template.evaluate(), 'Authorize');
    }
    makeRequest() {
        const params = Object.entries({
            'ids': 'channel==MINE',
            'startDate': '2023-03-15',
            'endDate': '2023-04-08',
            'metrics': 'views,likes,dislikes',
            'dimensions': 'day'
        }).map(([k, v]) => `${k}=${encodeURI(v)}`).join('&');
        Logger.log(params);
        const response = UrlFetchApp.fetch('https://youtubeanalytics.googleapis.com/v2/reports?' + params, {
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + this.service.getAccessToken(),
            },
            muteHttpExceptions: true,
        });
        Logger.log(response.getContentText());
    }
}
function ytAnalyticsAuthCallback(request) {
    const yt = new YTAnalytics();
    if (yt.service.handleCallback(request)) {
        return HtmlService.createHtmlOutput('Success! You can close this tab.');
    }
    else {
        return HtmlService.createHtmlOutput('Denied. You can close this tab');
    }
}
