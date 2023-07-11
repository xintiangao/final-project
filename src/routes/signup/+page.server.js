// import { redirect } from "@sveltejs/kit";
// import { OAuth2Client } from "google-auth-library";
// import { PUBLIC_CLIENT_ID, PUBLIC_CLIENT_SECRET } from '$env/static/public'

// export async function action ({}) {
//     const redirectURL = 'http://localhost:5173/oauth';

//     const oAuth2Client = new OAuth2Client(
//         PUBLIC_CLIENT_ID,
//         PUBLIC_CLIENT_SECRET,
//         redirectURL
//     )

//     const authorizeURL = oAuth2Client.generateAuthUrl({
//         access_type : "offline",
//         scpope : 'https://www.googleapis.com/auth/userinfo.profile openid',
//         prompt : 'consent'
//     });

//     throw redirect(320,authorizeURL);
// }