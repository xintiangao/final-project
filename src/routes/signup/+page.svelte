<!-- <script>
  import { PUBLIC_CLIENT_ID } from '$env/static/public'

  var YOUR_CLIENT_ID = PUBLIC_CLIENT_ID;
  var YOUR_REDIRECT_URI = 'http://localhost:5173/scan';
  var fragmentString = location.hash.substring(1);

  // Parse query string to see if page request is coming from OAuth 2.0 server.
  var params = {};
  var regex = /([^&=]+)=([^&]*)/g, m;
  while (m = regex.exec(fragmentString)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  if (Object.keys(params).length > 0) {
    localStorage.setItem('oauth2', JSON.stringify(params) );
    //hide the access token from url
    window.history.pushState({}, document.title, "/" + "signup")
    if (params['state'] && params['state'] == 'try_sample_request') {
      trySampleRequest();
    }
  }

  // If there's an access token, try an API request.
  // Otherwise, start OAuth 2.0 flow.
  function trySampleRequest() {
    var params = JSON.parse(localStorage.getItem('oauth2'));
    if (params && params['access_token']) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET',
          'https://www.googleapis.com/drive/v3/about?fields=user&' +
          'access_token=' + params['access_token']);
      xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4 && xhr.status === 200) {
          console.log(xhr.response);
        } else if (xhr.readyState === 4 && xhr.status === 401) {
          // Token invalid, so prompt for user permission.
          oauth2SignIn();
        }
      };
      xhr.send(null);
    } else {
      oauth2SignIn();
    }
  }

  /*
   * Create form to request access token from Google's OAuth 2.0 server.
   */
  function oauth2SignIn() {
    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create element to open OAuth 2.0 endpoint in new window.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    var params = {'client_id': YOUR_CLIENT_ID,
                  'redirect_uri': YOUR_REDIRECT_URI,
                  'scope': 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/cloud-platform openid',
                  'state': 'try_sample_request',
                  'include_granted_scopes': 'true',
                  'response_type': 'token'};

    // Add form parameters as hidden input values.
    for (var p in params) {
      var input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
  }
</script>

<style>
  .google-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 12px;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    color: #555;
    cursor: pointer;
  }

  .google-button__logo {
    width: 18px;
    height: 18px;
    margin-right: 8px;
  }
</style>

<button class="btn" on:click={oauth2SignIn}>Log In with Google</button>

<button id="signin-button" class="google-button" on:click={oauth2SignIn}>
  <img
    src="https://developers.google.com/identity/images/g-logo.png"
    alt="Sign in with Google"
    class="google-button__logo"
  />
  Sign in with Google
</button> -->
