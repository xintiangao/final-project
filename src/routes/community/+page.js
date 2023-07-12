// import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';

// export async function load({ fetch, params }) {
//   const resp = await fetch(PUBLIC_BACKEND_BASE_URL + `/community`);

//   const res = await resp.json();
//   if (resp.status == 200) {
//     return {
//         communityPosts: res
//     }
//   } else {
//     return {
//         communityPosts: []
//     }
//   }
// }

import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';

export async function load({ fetch, params }) {
  const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/community');
  const res = await resp.json();

  const expenseResp = await fetch(PUBLIC_BACKEND_BASE_URL + '/expense-input');
  const expenseData = await expenseResp.json();

  if (resp.status == 200) {
    return {
      communityPosts: res,
      expenseData: expenseData  
    };
  } else {
    return {
      communityPosts: [],
      expenseData: []  
    };
  }
}
