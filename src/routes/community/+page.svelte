<script>
  import { onMount } from 'svelte';
  import { getUserId } from "../../utils/auth";
  import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
  // import { calculateTotal, data, CalculateTotalSaving } from '../utils.js'
  // import Chart from 'chart.js/auto'

  let communityPosts = [];
  let myPost = [];
  let expenseData = [];
  let userId = getUserId();
  

  async function fetchCommunityPosts() {
    communityPosts = await fetch(PUBLIC_BACKEND_BASE_URL + `/community`).then((response) => response.json());
    console.log(communityPosts)
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

// let pieChart;
  
//   onMount(
//     async () => {
//       await fetchExpenseData();

//       const currentDate = new Date();
//       const currentMonth = currentDate.getMonth();
//       const currentYear = currentDate.getFullYear();

//       const labelsMap = new Map();
//       expenseData.forEach((expense) => {
//         const expenseDate = new Date(expense.date);
//         const expenseMonth = expenseDate.getMonth();
//         const expenseYear = expenseDate.getFullYear();

//         if (expenseMonth === currentMonth && expenseYear === currentYear) {
//           const category = expense.category;
//           const amount = expense.amount;
//           if (labelsMap.has(category)) {
//             const currentAmount = labelsMap.get(category);
//             labelsMap.set(category, currentAmount + amount);
//           } else {
//             labelsMap.set(category, amount);
//           }
//         }
//       });

//       const labels = Array.from(labelsMap.keys());
//       const data = Array.from(labelsMap.values());

      
// await new Chart(pieChart, {
//         type: 'pie',
//         data: {
//           labels: labels,
//           datasets: [{
//             label: 'month expenses',
//             data: data,
//           }]
//         },
//       });
//     }
//   );

</script>
<section class="flex flex-wrap justify-around">
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  {#each myPost as post}
  <div class="w-96 bg-base-100 shadow-xl m-5 font-mono ">
  <!-- {#each post as expense} -->
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
      <img class="w-full h-full" src={post.chartData} alt/>
    </div>
    <!-- {/each} -->
  </div>
  {/each}


{#each communityPosts as post}
<!-- {#each expenseData as expense} -->
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
      <img class="w-full h-full" src={post.chartData} alt/>
    </div>
</div>
<!-- {/each} -->
{/each}

</section>