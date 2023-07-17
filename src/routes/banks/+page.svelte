<script>
  import { getUserId, getTokenFromLocalStorage } from "../../utils/auth";
  import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
  import { onMount } from "svelte";

  let isLoading = false;
  let bankRows = [];
  let bankId = '';
  let rowNumber = 1;
  let bankData = [];
  let successMessage = false;
  let cashBackData = [];
  let category = "";
  let name = "";
  let cashBack = "";

  async function fetchCashBackData() {
    cashBackData = await fetch(PUBLIC_BACKEND_BASE_URL + `/cashBack`).then((response) => response.json());
  }
  onMount(fetchCashBackData);

  async function fetchBankData() {
    bankData = await fetch(PUBLIC_BACKEND_BASE_URL + `/bank`).then((response) => response.json());
  }
  onMount(fetchBankData);

  export function addBankRow() {
    bankRows = [...bankRows, {}];
    rowNumber++;
  }

  async function uploadBankInfo(evt) {
    evt.preventDefault();

    const formData = new FormData(evt.target);
    const submittedData = [];

    const formErrors = {
      name: '',
      cashBack: '',
      category: '',
    };

    // Validate form inputs
    if (!formData.get('name')) {
      formErrors.bank = 'Please enter a bank name.';
    } else {
      formErrors.bank = '';
    }

    const bankRows = document.querySelectorAll('#bankRows tr');
    bankRows.forEach((row, index) => {
      const name = formData.get(`name_${index}`);
      const category = formData.get(`category_${index}`);
      const cashBack = formData.get(`cashBack_${index}`);

      if (!name) {
        formErrors[`name_${index}`] = 'Please enter a bank.';
      } else {
        formErrors[`name_${index}`] = '';
      }

      if (!category) {
        formErrors[`category_${index}`] = 'Please select a category.';
      } else {
        formErrors[`category_${index}`] = '';
      }

      if (!cashBack) {
        formErrors[`cashBack_${index}`] = 'Please enter a cash back percentage.';
      } else {
        formErrors[`cashBack_${index}`] = '';
      }

      submittedData.push({ name, category, cashBack });
    });

    const userId = parseInt(getUserId());
    const token = getTokenFromLocalStorage();

    for (const data of submittedData) {
      const { name, category, cashBack } = data;

      const bankData = {
        userId: userId,
        name: name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
      };

      const bankResp = await fetch(PUBLIC_BACKEND_BASE_URL + '/bank', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bankData),
      }).catch((error) => {
        console.error('Error:', error);
      });

      if (bankResp && bankResp.status === 200) {

        const bankJson = await bankResp.json();
        bankId = parseInt(bankJson.id);

        const cashBackData = {
          category: category,
          cashBack: cashBack,
          bankId: bankId,
        };

        const cashBackResp = await fetch(PUBLIC_BACKEND_BASE_URL + '/cashback', {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cashBackData),
        }).catch((error) => {
          console.error('Error:', error);
        });

        if (cashBackResp && cashBackResp.status === 200) {
          location.reload();
        } else {
          console.log('Failed to upload cash back data');
        }
      } else {
        console.log('Failed to upload bank data');
      }
    }
  }

  function startEditing(cashback) {
    editedBank = { ...cashback };
    name = editedBank.name;
    cashBack = editedBank.cashBack.toString();
    category = editedBank.category;
  }

  function cancelEditing() {
    editedBank = null;
  }

  let editedBank = {
    id: '',
    category: '',
    cashBack: '',
    name: '',
  };

  function showSuccessMessage() {
    successMessage = true;
    setTimeout(() => {
      successMessage = false;
    }, 2000);
  }

  async function deleteHistory(cashBackId) {
    const confirmation = confirm('Are you sure you want to delete this cash back?');
    if (confirmation) {
      const resp = await fetch(PUBLIC_BACKEND_BASE_URL + `/cashBack/${cashBackId}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getTokenFromLocalStorage()
        }
      });

      if (resp.status === 200) {
        cashBackData = cashBackData.filter((item) => item.id !== cashBackId);
        showSuccessMessage();
      } else {
        console.error('Failed to delete cash back:', error);
      }
    }
  }

  async function updateBankInfo(evt) {
    evt.preventDefault();

    const userId = parseInt(getUserId());

    cashBackData = await fetch(PUBLIC_BACKEND_BASE_URL + `/cashback/${editedBank.id}`).then((response) => response.json());

    const updateData = {
      id: parseInt(editedBank.id),
      name: (evt.target["name"].value).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' '),
      category: parseInt(evt.target["category_"].value),
      cashBack: evt.target["cashBack"],
      userId: userId,
    };

    const resp = await fetch(PUBLIC_BACKEND_BASE_URL + `/cashback/${cashBack.id}`, {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        Authorization: getTokenFromLocalStorage()
      },
      body: JSON.stringify(updateData)

    });

    if (resp.status === 200) {
      showSuccessMessage();
      cancelEditing();
    } else {
      console.error('Failed to update cash back:', error);
    }
  }

  export function deleteRow(index) {
    bankRows.splice(index, 1);
    rowNumber--;
  }
</script>

<div class="flex w-full h-full justify-center item-center text-center font-mono text-2xl normal-case">
  Your Bank Information
</div>
<div class="text-center">
  <h2 class="text-center text-m mb-5 mt-2 font-mono">
    <div class="italic text-xs">
      Input your credit card's cash back category below.
    </div>
  </h2>
</div>

<div class="bg-primary w-1/2 h-full flex items-center justify-center content-center mr-auto ml-auto font-mono text-primary rounded-xl p-5">
  <form on:submit={uploadBankInfo}>
    <table class="table form-control text-center flex align-middle">
      <thead class="text-2xl">
        <tr>
          <th>Bank</th>
          <th>Category</th>
          <th>Cash-Back %</th>
          <th>
            <button type="button" on:click={addBankRow}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </th>
        </tr>
      </thead>
      <tbody id="bankRows" class="p-5">
        {#each Array.from({ length: rowNumber }) as _, index}
        <tr>
          <td>
            <div class="form-control w-full">
              <label for="name">
              </label>
              <input type="name" name={`name_${index}`} placeholder="Chase Unlimited"
                class="input input-bordered w-full" required />
            </div>
          </td>
          <td>
            <div class="dropdown dropdown-bottom flex flex-start">
              <select name={`category_${index}`} class="select select-bordered w-32">
                <option disabled selected>category</option>
                {#each ['Clothes', 'Dining', 'Drug Store', 'Entertainment', 'Gas', 'Grocery', 'Others', 'Rent', 'Subscription', 'Transport', 'Travel','Default',] as option}
                <option value={option.toLowerCase()}>{option}</option>
                {/each}
              </select>
            </div>
          </td>
          <td>
            <div class="form-control w-full">
              <label for="cashBack">
              </label>
              <input type="cashBack" name={`cashBack_${index}`} placeholder="5" class="input input-bordered w-full"
                required />
            </div>
          </td>
          <td>
            <button on:click={() => deleteRow(cashBack.id)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path
                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </td>
        </tr>
        {/each}
      </tbody>
    </table>
    <div class="form-control item-center mt-8 flex justify-center w-1/3 ml-auto mr-auto">
      {#if isLoading}
      <div class="flex justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="4" />
          <path fill="currentColor" d="M12 2v4m0 12v4m-4-4H2M18 2h4" />
        </svg>
        <span class="text-lg text-gray-700">Loading...</span>
      </div>
      {:else}
      <button type="submit" class="btn btn-md">Upload Information</button>
      {/if}
    </div>
  </form>
</div>

<div class="first-letter:uppercase">
  {#if successMessage}
  <div class="flex justify-center">
    <div class="alert alert-success rounded-lg w-[80%]">
      <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>The credit card has been updated!</span>
    </div>
  </div>
  {/if}
  <div class="overflow-x-auto m-10 w-2/3 ml-auto mr-auto">
    <form on:submit={updateBankInfo}>
      <table class="table font-mono p-10">
        <!-- head -->
        <thead class="bg-primary rounded-md table-pin-rows">
          <tr class="font-bold text-lg">
            <th>
            </th>
            <th>Credit Card</th>
            <th>Category</th>
            <th>Cash-Back %</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {#each bankData.sort((a, b) => a.name.localeCompare(b.name)) as bank}
          {#each cashBackData.filter(c => c.bankId === bank.id) as cashBack}
          <!-- row 1 -->
          <tr class="hover">
            {#if editedBank && editedBank.id === bank.id}
            <!-- Edit mode -->
            <td></td>
            <td>
              <div class="form-control w-full">
                <label for="name"></label>
                <input type="text" name="name" bind:value={name} required>
              </div>
            </td>
            <td>
              <div class="form-control w-full dropdown dropdown-bottom flex flex-start">
                <label for="category"></label>
                <select name="category" bind:value={category} required>
                  <option disabled selected>Choose a category</option>
                  {#each ['Clothes', 'Dining', 'Drug Store', 'Entertainment', 'Gas', 'Grocery', 'Rent', 'Subscription', 'Transport', 'Travel','Others','Default',] as option}
                  <option value={option.toLowerCase()}>{option}</option>
                  {/each}
                </select>
              </div>
            </td>
            <td>
              <div class="form-control w-full">
                <label for="cashBack"></label>
                <input type="text" name="cashBack" bind:value={cashBack.cashBack} required>
              </div>
            </td>
            <td>
              <button type="submit">Save</button>
              <button on:click={cancelEditing}>Cancel</button>
            </td>
            {:else}
            <th></th>
            <td>{bank.name}</td>
            <td>{cashBack.category}</td>
            <td>{cashBack.cashBack}</td>
            <td>
              <button on:click={() => startEditing(cashBack)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path
                    d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                  <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                </svg>
              </button>
              <button on:click={() => deleteHistory(cashBack.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </td>
            {/if}
          </tr>
          {/each}
          {/each}
        </tbody>
      </table>
    </form>
  </div>
</div>
