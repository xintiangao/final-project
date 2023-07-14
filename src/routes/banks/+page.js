import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';

export async function load({ fetch, params }) {
  const resp = await fetch(PUBLIC_BACKEND_BASE_URL + `/bank`);
  const res = await resp.json();

  const cashResp = await fetch(PUBLIC_BACKEND_BASE_URL + `/cashback`);
  const cashRes = await cashResp.json();

  if (resp.status == 200 && cashResp.status == 200) {
    return {
      bankData: res,
      cashBackData: cashRes
    }
  } else {
    return {
      bankData: [],
      cashBackData: []
    }
  }
}

