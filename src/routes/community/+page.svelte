<script>
  import { onMount } from 'svelte';
//   import { getUserId } from "../utils/auth";
  import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
  import { calculateTotal } from '../utils.js'

  let expenseData = [];
  let communityPosts = [];

  async function fetchCommunityPosts() {
    communityPosts = await fetch(PUBLIC_BACKEND_BASE_URL + `/community`).then((response) => response.json());
  }
  onMount(fetchCommunityPosts);


async function fetchExpenseData() {
  expenseData = await fetch(PUBLIC_BACKEND_BASE_URL + `/expense-input`).then((response) => response.json());
}
onMount(fetchExpenseData);


</script>

<section class="flex flex-wrap justify-around">
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div class="w-96 bg-base-100 shadow-xl m-5">
    <div class="card-body">
      <h2 class="card-title">Saving and Spending</h2>
      <div class="rounded-box h-60 bg-secondary overflow-scroll drop-shadow-lg">
        <div class="stat">
            <div class="stat-title">Total Spend this month</div>
            <div class="stat-value">${calculateTotal(expenseData)}</div>
            <div class="stat-actions">
                <a class="btn btn-sm" href='/history'>View transaction history</a>
            </div>
        </div>
        <div class="stat">
            <div class="stat-title">Total Saving</div>
            <div class="stat-value">$89,400</div>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto ml-4 mr-4">
        <table class="table">
          <!-- head -->
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Expense</th>
              <th>Income</th>
            </tr>
          </thead>
          <tbody>
            {#each communityPosts as post}
            {#each expenseData as expense}
                <tr>
                <td>{expense.category}</td>
                <td>{expense.amount}</td>
                <td>{post.income}</td>
                </tr>
            {/each}
            {/each}
          </tbody>
        </table>
    </div>
</div>

{#each communityPosts as post}
{#each expenseData as expense}
<div class="w-96 bg-base-100 shadow-xl m-5">
    <div class="card-body">
      <h2 class="card-title">Saving and Spending</h2>
      <div class="rounded-box h-60 bg-secondary overflow-scroll drop-shadow-lg">
        
        <div class="bg-secondary text-primary-content">
        <div class="stat">
            <div class="stat-title">Total Spend this month</div>
            <div class="stat-value">${post.totalSpend}</div>
        </div>
        <div class="stat">
            <div class="stat-title">Total Saving</div>
            <div class="stat-value">${post.totalSaving}</div>
        </div>
        </div>
      </div>
    </div>
    <div class="overflow-x-auto ml-4 mr-4">
        <table class="table">
          <!-- head -->
          <thead>
            <tr>
              <th>Category</th>
              <th>Total Expense</th>
              <th>Income</th>
            </tr>
          </thead>
          <tbody>
                <tr>
                <td>{expense.category}</td>
                <td>{expense.amount}</td>
                <td>{post.income}</td>
                </tr>
          </tbody>
        </table>
    </div>
</div>
{/each}
{/each}

</section>