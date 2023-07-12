<script>
    import { processDocument } from "../../utils/receipt"
    import { afterUpdate } from 'svelte';
  
    let result = {};
    let selectedImage = null;

    var params = {};
  var regex = /([^&=]+)=([^&]*)/g, m;
  var fragmentString = location.hash.substring(1);

  while (m = regex.exec(fragmentString)) {
    params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
  }
  if (Object.keys(params).length > 0) {
    localStorage.setItem('oauth2', JSON.stringify(params) );
    //hide the access token from url
    window.history.pushState({}, document.title, "/" + "scan")
    // if (params['state'] && params['state'] == 'try_sample_request') {
    //   trySampleRequest();
    // }
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
  </script>
  
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
    <div>
      <h3>Parsing Result:</h3>
      {#if result}
        <p><strong>Supplier Name:</strong> {result.supplierName}</p>
        <p><strong>Purchase Date:</strong> {result.receiptDate}</p>
        <p><strong>Purchase Time:</strong> {result.receiptTime}</p>
        <p><strong>Total Amount:</strong> {result.totalAmount}</p>
      {:else}
        <p>No result available.</p>
      {/if}
    </div>
  </div>