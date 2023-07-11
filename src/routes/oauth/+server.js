import { redirect } from "@sveltejs/kit";
import { OAuth2Client } from "google-auth-library";
import { PUBLIC_CLIENT_ID, PUBLIC_CLIENT_SECRET } from '$env/static/public'

export const GET = async ({url})=>{
    const redirectURL = 'http://localhost:5173/oauth';
    const code = await url.searchParams.get('code');
    console.log('return code', code)

    try {
        const oAuth2Client = new OAuth2Client(
            PUBLIC_CLIENT_ID,
            PUBLIC_CLIENT_SECRET,
            redirectURL
        );

        const res = await oAuth2Client.getToken(code);
        oAuth2Client.setCredentials(res.tokens);
        console.log("Auth Tokens Received");
        const user = oAuth2Client.credentials;
        console.log ('Credentials', user);

    } catch {
        console.log ("error logging in Google", err)
    }
    throw redirect (303, '/')
}