<!-- to create a form to provide user input on expenses -->

<script>
    import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
    import { goto } from '$app/navigation';
    import { getaccessTokenFromLocalStorage } from '../../utils/auth';
    import { getUserId } from '../../utils/auth';
    import { onMount } from 'svelte';
    import flatpickr from 'flatpickr';
    import 'flatpickr/dist/flatpickr.min.css';
    import { processDocument } from "../../utils/receipt.js"
    import { afterUpdate } from 'svelte';

    let result = {};
    let selectedImage = null;

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
    window.history.pushState({}, document.title, "/" + "expense")
  }
  
    async function parseDocument(evt) {
      try {
        selectedImage = URL.createObjectURL(evt.target['file'].files[0]);
        result = await processDocument(evt.target['file'].files[0]);
      } catch (error) {
        console.error("An error occurred:", error);
        alert("Error occurred while processing the document. Please try again.");
      }
    }
  
    // Use afterUpdate to trigger UI updates after the result is updated
    afterUpdate(() => {
      // console.log(result);
    });

    let formErrors = {};

    let selectedDate;
  
    onMount(() => {
      flatpickr('#date-input', {
        dateFormat: 'Y-m-d',
        enable: [
          {
            from: 'today',
            to: new Date().fp_incr(365),
          },
        ],
      // Add any other options or customizations as needed
        onChange: (selectedDates) => {
          selectedDate = selectedDates[0];
        },
      });
    });

    function postInputExpenses() {
        goto('/');
    }

    async function InputExpenses(evt) {
        evt.preventDefault();

        const userId = getUserId();
        console.log(userId)

        const ExpensesData = {
        userId: userId,
        category: evt.target['category'].value,
        amount: parseInt(evt.target['amount'].value),
        note: evt.target['note'].value,
        date: selectedDate,
       };

       const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/expense-input', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization : `Bearer ${getaccessTokenFromLocalStorage()}`
        },
        body: JSON.stringify(ExpensesData)
        })

        if (resp.status == 200) {
          postInputExpenses();
        } else {
          const res = await resp.json();
          formErrors = res.data
          console.log(ExpensesData)
        }   
    }
</script>

<!-- to input the logic where if you are loggedin then you can parse the document but if you are not loggedin then you need to go to the login/sign in with google first -->

<style>
    .container {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
  
    .form-group {
      margin-bottom: 15px;
    }
  
    .form-group label {
      font-weight: bold;
      display: block;
    }
  
    .form-group input[type="file"] {
      margin-top: 5px;
    }
  
    .form-group button {
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  </style>
  
  <div class="container">
    <form on:submit|preventDefault={parseDocument}>
      <h2>Document Parser</h2>
      <div class="form-group">
        <label for="file">Select a file:</label>
        <input type="file" name="file" class="file-input file-input-bordered file-input-secondary w-full" />
      </div>
      <div class="form-group">
        <button class="btn">Parse Document</button>
      </div>
    </form>
  <!-- preview image on click -->
    {#if selectedImage}
      <div class="image-preview">
        <h3>Image Preview:</h3>
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img src="{selectedImage}" alt="Selected Image" />
      </div>
    {/if}
  
    <!-- return results -->
    <!-- <div>
      <h3>Parsing Result:</h3>
      {#if result}
        <p><strong>Supplier Name:</strong> {result.supplierName}</p>
        <p><strong>Purchase Date:</strong> {result.receiptDate}</p>
        <p><strong>Purchase Time:</strong> {result.receiptTime}</p>
        <p><strong>Total Amount:</strong> {result.totalAmount}</p>
      {:else}
        <p>No result available.</p>
      {/if}
    </div> -->
  </div>

<div class="flex justify-center items-start mt-8">
  <form on:submit={InputExpenses} class="w-1/3">
    <div class="form-control mb-4">
      <label class="label" for="date">
        <span class="label-text">Date</span>
      </label>
      <input type="text" name="date" id="date-input" placeholder="YYYY-MM-DD" class="input input-bordered w-full" bind:value={result.receiptDate} />
      {#if 'date' in formErrors}
        <label class="label" for="date">
          <span class="label-text-alt text-red-500">{formErrors['date'].message}</span>
        </label>
      {/if}
    </div>

    <div class="form-control mb-4">
      <label class="label" for="amount">
        <span class="label-text">Amount</span>
      </label>
      <input type="number" name="amount" placeholder="amount" class="input input-bordered w-full" bind:value={result.totalAmount} required />
      {#if 'amount' in formErrors}
        <label class="label" for="amount">
          <span class="label-text-alt text-red-500">{formErrors['amount'].message}</span>
        </label>
      {/if}
    </div>

    <div class="form-control mb-4">
      <label class="label" for="category">
        <span class="label-text">Category</span>
      </label>
      <select name="category" class="select select-bordered w-full" required>
        <option value="">Select a category</option>
        <option value="Food">Food</option>
        <option value="Transportation">Transportation</option>
        <option value="Rent">Rent</option>
        <option value="Gas">Gas</option>
        <option value="Entertainment">Entertainment</option>
        <option value="Clothes">Clothes</option>
        <option value="Subscriptions">Subscription</option>
        <option value="Others">Others</option>
        <!-- Add more options as needed -->
      </select>
      {#if 'category' in formErrors}
        <label class="label" for="category">
          <span class="label-text-alt text-red-500">{formErrors['category'].message}</span>
        </label>
      {/if}
    </div>

    <div class="form-control mb-4">
      <label class="label" for="note">
        <span class="label-text">Notes</span>
      </label>
      <textarea name="note" placeholder="Notes about your expenses" class="textarea h-24 resize-y w-full border border-gray-300 rounded-md p-2" bind:value={result.supplierName} required></textarea>
      {#if 'note' in formErrors}
        <label class="label" for="note">
          <span class="label-text-alt text-red-500">{formErrors['note'].message}</span>
        </label>
      {/if}
    </div>

    <div class="form-control">
      <button class="btn btn-md">Save</button>
    </div>
  </form>
</div>
