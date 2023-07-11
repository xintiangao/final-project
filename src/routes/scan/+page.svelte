<script>
    import { processDocument } from "../../utils/receipt"
    import { afterUpdate } from 'svelte';
  
    let result = {};
  
    async function parseDocument(evt) {
      try {
        result = await processDocument(evt.target['file'].files[0]);
      } catch (error) {
        console.error("An error occurred:", error);
        alert("Error occurred while processing the document. Please try again.");
      }
    }
  
    // Use afterUpdate to trigger UI updates after the result is updated
    afterUpdate(() => {
      console.log(result.supplierName);
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
  
    <div>
      <h3>Parsing Result:</h3>
      {#if result.supplierName}
        <p><strong>Supplier Name:</strong> {result.supplierName}</p>
        <p><strong>Purchase Date:</strong> {result.receiptDate}</p>
        <p><strong>Purchase Time:</strong> {result.receiptTime}</p>
        <p><strong>Total Amount:</strong> {result.totalAmount}</p>
      {:else}
        <p>No result available.</p>
      {/if}
    </div>
  </div>