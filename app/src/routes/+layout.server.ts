import type {LayoutServerLoad} from "./$types";
import {SEMINARIAN_API_TOKEN, SEMINARIAN_API_URL} from '$env/static/private';


export const load: LayoutServerLoad = async(event) => {
    return {
        session: await event.locals.auth(),
        //token: SEMINARIAN_API_TOKEN,  //to ensure that .env is loaded correctly
        //api_url: SEMINARIAN_API_URL
    }
}

