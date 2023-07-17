<script>
  import { onMount } from 'svelte';
  import { getUserId } from "../../utils/auth";
  import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';

  let communityPosts = [];
  let myPost = [];
  let expenseData = [];
  let userId = getUserId();

  async function fetchCommunityPosts() {
    communityPosts = await fetch(PUBLIC_BACKEND_BASE_URL + `/community`).then((response) => response.json());
  }
  onMount(fetchCommunityPosts);

  async function fetchMyPosts() {
    myPost = await fetch(PUBLIC_BACKEND_BASE_URL + `/community/${userId}`).then((response) => response.json());
  }

  async function fetchExpenseData() {
    expenseData = await fetch(PUBLIC_BACKEND_BASE_URL + `/expense-input/${userId}`).then((response) => response.json());
  }

  onMount(fetchMyPosts);
  onMount(fetchExpenseData);

</script>

<section class="flex flex-wrap justify-around">
  {#each myPost as post}
  <div class="w-96 bg-base-100 shadow-xl m-5 font-mono">
    <div class="card-body">
      <h2 class="card-title">Saving and Spending</h2>
      <h3> Posted on {new Date(post.createdAt).toLocaleDateString()}</h3>
      <div class="rounded-box h-60 bg-secondary overflow-scroll drop-shadow-lg">
        <div class="stat">
          <div class="stat-title">Total Spend this month</div>
          <div class="stat-value">${post.totalSpend}</div>
          <div class="stat-actions">
            <a class="btn btn-sm" href='/history'>View transaction history</a>
          </div>
        </div>
        <div class="stat">
          <div class="stat-title">Total Saving</div>
          <div class="stat-value">${post.totalSaving}</div>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto ml-4 mr-4">
      <img class="w-full h-full" src={post.chartData} alt />
    </div>
  </div>
  {/each}

  {#each communityPosts as post}
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
      <img class="w-full h-full" src={post.chartData} alt />
    </div>
  </div>
  {/each}
</section>
