import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
import { getTokenFromLocalStorage} from '../../utils/auth.js'; 

//use to fetch data from the database through current logged-in user id//
export async function load({ fetch }) {

  const token = getTokenFromLocalStorage();

  const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/calculation-record', {
        method: 'GET',
        mode: 'cors',
        headers: {
			'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
		},
    });
    
  const res = await resp.json();
  console.log(res);
    if (resp.status == 200) {
      return {
        record: res
      }
    } else {
      return {
        record: []
      }
    }
  }