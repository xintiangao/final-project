<script>
	import { goto } from '$app/navigation';
	import { authenticateUser, isAuthenticated, goToCreateUser } from '../../utils/auth.js';
	import { onMount } from 'svelte';
	import { PUBLIC_CLIENT_ID } from '$env/static/public'

	var YOUR_CLIENT_ID = PUBLIC_CLIENT_ID;
  	var YOUR_REDIRECT_URI = 'http://localhost:5173/expenses';
  	var fragmentString = location.hash.substring(1);

	let isLoading = false;
	let showModal = false;
	let showErrorMessage = false; 
	let email = '';
	let password = '';

	// Parse query string to see if page request is coming from OAuth 2.0 server.
	var params = {};
	var regex = /([^&=]+)=([^&]*)/g, m;
	while (m = regex.exec(fragmentString)) {
		params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
	}
	if (Object.keys(params).length > 0) {
		localStorage.setItem('oauth2', JSON.stringify(params) );
		//hide the access token from url
		window.history.pushState({}, document.title, "/" + "expenses")
	}

	export async function signIn(evt) {
		evt.preventDefault();

		const userData = {
			email: evt.target['email'].value,
			password: evt.target['password'].value
		};

		isLoading = true;
		email = userData.email;

		const res = await authenticateUser(userData.email, userData.password);

		isLoading = false;

		if (res.success) {
			goto('/');
			showModal = true;
		} else {
			showErrorMessage = true;
		}
	}

	// Reset the error message when the component mounts
	onMount(() => {
		showErrorMessage = false;
		email = '';
		password = '';
	});

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

{#if $isAuthenticated}
	<div class="alert-error p-5 w-1/2 ml-auto mr-auto rounded-xl flex justify-center item-center">
		You are already logged in.
	</div>
{:else}
	<h1 class="text-center text-xl">Log In</h1>
	<h2 class="text-center text-sm mt-5">
		<button on:click={goToCreateUser}>
			Don't have an account? Click <u>here</u> to sign up.
		</button>
	</h2>
	{#if showErrorMessage}
		<div class="flex justify-center w-full">
			<div class="alert alert-warning shadow-lg" style="width: 90%;">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="stroke-current flex-shrink-0 w-6 h-6"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<span class="text-start mr-auto">Please check your email / password</span>
			</div>
		</div>
	{/if}

	<div class="flex justify-center items-center mt-8">
		<form on:submit={signIn} class="w-1/3">
			<div class="form-control w-full">
				<label class="label" for="email">
					<span class="label-text">email</span>
				</label>
				<input
					type="text"
					name="email"
					placeholder="example@example.com"
					class="input input-bordered w-full"
				/>
			</div>

			<div class="form-control w-full">
				<label class="label" for="password">
					<span class="label-text">Password</span>
				</label>
				<input
					type="password"
					name="password"
					placeholder=""
					class="input input-bordered w-full"
					required
				/>
			</div>

			<div class="form-control w-full mt-4">
				<div class="form-control w-full mt-4">
					{#if isLoading}
						<div class="flex justify-center items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700"
							>
								<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="4" />
								<path fill="currentColor" d="M12 2v4m0 12v4m-4-4H2M18 2h4" />
							</svg>
							<span class="text-lg text-gray-700">Loading...</span>
						</div>
					{:else}
						<button class="btn btn-md">Log In</button>
					{/if}
				</div>
			</div>

			<div class="flex justify-center items-center mt-8">
				<div class="form-control w-full mt-4">
					<button id="signin-button" class="google-button" on:click={oauth2SignIn}>
						<img
						src="https://developers.google.com/identity/images/g-logo.png"
						alt="Sign in with Google"
						class="google-button__logo"
						/>
						Log in with Google to use scanner
					</button>
				</div>
			</div>
		</form>
	</div>
{/if}

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
	  transition: border-color 0.3s ease-in-out; /* Add transition for smooth effect */
	}
  
	.google-button:hover {
	  border-color: blue; /* Change the border color on hover */
	}
  
	.google-button__logo {
	  width: 18px;
	  height: 18px;
	  margin-right: 8px;
	}
  </style>