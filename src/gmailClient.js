import { gapi } from "gapi-script";

const CLIENT_ID = "10934111227-ncgvgn28puprl174798i19ia9pif5ior.apps.googleusercontent.com"
const SCOPES = "https://www.googleapis.com/auth/gmail.settings.basic";

export function initGapiClient() {
    return new Promise((resolve, reject) => {
        gapi.load("client:auth2", async () => {
            try {
                await gapi.client.init({
                    clientId: CLIENT_ID,
                    scope: SCOPES,
                });

                await gapi.client.load("gmail", "v1");

                resolve(true);
            } catch (error) {
                reject(error);
            }
        })
    })
}

export function signIn() {
    return gapi.auth2.getAuthInstance().signIn();
}

export function listFilters() {
    return gapi.client.gmail.users.settings.filters.list({
        userId: "me",
    });
}
  