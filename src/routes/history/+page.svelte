<script>
  import { onMount } from "svelte";
  import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
  import { getTokenFromLocalStorage, getUserId } from "../../utils/auth";
  export let data;

 
  let expenseData = [];
  
  async function fetchExpenseData() {
      expenseData = await fetch(PUBLIC_BACKEND_BASE_URL + `/expense-input`).then((response) => response.json());
  }
  
  onMount(fetchExpenseData);
  
  function sortByAmount() {
    const tableBody = document.querySelector('table tbody');
    const rows = Array.from(tableBody.querySelectorAll('tr'));
  
    rows.sort((a, b) => {
      const amountA = parseInt(a.children[2].textContent);
      const amountB = parseInt(b.children[2].textContent);
      return amountB - amountA;
    });
    rows.forEach((row) => tableBody.appendChild(row));
  }
  
  function sortByDate() {
    let created = []
  
    for ( let i = 0; i < expenseData.length; i++ ){
      created.push(expenseData[i].date);
    }
    created.sort((a, b) => new Date(b) - new Date(a));
  }
  
  function startEditing(expense) {
    editedExpense = { ...expense };
    category = editedExpense.category;
    amount = editedExpense.amount.toString();
    note = editedExpense.note;
    date = editedExpense.date;
  }
  
  function cancelEditing() {
    editedExpense = null;
  }
  
  let editedExpense = {
    category: '',
    amount: '',
    note: '',
    date: ''
  };

  let category = data.category;
  let amount = data.amount;
  let note = data.note;
  let date = data.date; 
  
  async function updateExpenses(evt) {
    evt.preventDefault();
  
    let userId = parseInt(getUserId())
  
    const expenseData = {
      id: data.expense[0].id,
      category: evt.target['category'].value,
      amount: parseInt(evt.target['amount'].value),
      date: evt.target['date'].value,
      userId: userId,
      note: evt.target['note'].value
    };
  
    // let token = getTokenFromLocalStorage();
  
    const resp = await fetch(PUBLIC_BACKEND_BASE_URL + `/expense-input/${expense.id}`, {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${token}`
        Authorization: getTokenFromLocalStorage()
      },
      body: JSON.stringify(expenseData)
  
    });
     if (resp.status == 200) {
     } else {
        console.error('Failed to create record:', error);
      }
  }
  
  </script>
  
  <container class="first-letter:uppercase ">
      <div class="overflow-x-auto m-10">
        <form on:submit={updateExpenses}>
          <table class="table font-mono p-10">
            <!-- head -->
            <thead class="bg-primary rounded-md table-pin-rows">
              <tr class="font-bold text-lg">
                <th>
                  <!-- svelte-ignore a11y-no-static-element-interactions -->
                  <label class="swap swap-rotate"><input type="checkbox" />
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="swap-on tooltip tooltip-right" data-tip="Sort by date" on:click={sortByDate}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <div class="swap-off tooltip tooltip-right" data-tip="Sort by amount" on:click={sortByAmount}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                  </label>                  
                </th>
                <th>Category</th>
                <th>Amount</th>
                <th>Note</th>
                <th>Date Created</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {#each expenseData as expense}
              <!-- row 1 -->
              <tr class="hover">
              {#if editedExpense && editedExpense.id === expense.id}
            <!-- Edit mode -->
            <td></td>
            <td>
              <div class="form-control w-full dropdown dropdown-bottom flex flex-start">
                <label for="category"></label>
                <select name="category" bind:value={category} required>
                  <option disabled selected>Choose a category</option>
                  <option>Food</option>
                  <option>Gas</option>
                  <option>Rent</option>
                  <option>Transport</option>
                  <option>Entertainment</option>
                  <option>Clothes</option>
                  <option>Subscription</option>
                  <option>Others</option>
                </select>
              </div>
            </td>
            <td>
              <div class = "form-control w-full">
                <label for="amount"></label> 
                    <input type ="text" name = "amount" bind:value={amount} required>
              </div>
              <!-- <input type="text" bind:value={editedExpense.amount} /> -->
            </td>
            <td>
              <div class = "form-control w-full">
                <label for="note"></label> 
                    <input type ="text" name = "note" bind:value={note}>
              </div>
              <!-- <input type="text" bind:value={editedExpense.note} /> -->
            </td>
            <td>
              <div class = "form-control w-full">
                <label for="date"></label> 
                    <input type ="date" name = "date" bind:value={date} required>
              </div>
              <!-- <input type="date" bind:value={editedExpense.date} /> -->
            </td>
            <td>
              <button type="submit">Save</button>
              <button on:click={cancelEditing}>Cancel</button>
            </td>
            {:else}
              <th></th>
              <td>{expense.category}</td>
              <td>{expense.amount}</td>
              {#if expense.note == null}
              <td></td>
              {:else}
              <td>{expense.note}</td>
              {/if}
              <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>
                  <!-- <a class="font-bold text-2xl" href="/history/{expense.id}">Edit</a> -->
                  <button on:click={() => startEditing(expense)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
                  </button>
                </td>
                {/if}
              </tr>
              {/each}
            </tbody>
          </table>
        </form>
        </div>
  </container>