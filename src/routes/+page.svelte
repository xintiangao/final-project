<!-- // Xintian -->
<script>
    import Chart from 'chart.js/auto'
    import { onMount } from 'svelte';
    import { addRow, addGoalRow, uploadExpenses } from './utils.js'
    
let pieChart;
onMount(
    async ()=>{
      new Chart(pieChart, {
        type: 'pie',
        data: {
            labels: ['food', 'gas', 'rent', 'clothes', 'entertainment', 'transport'],
            datasets: [{
            label: 'month expenses',
            data: [12, 19, 3, 5, 2, 3],
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
      });
    }
)

let lineChart;
onMount(async () => {
  const currentMonth = new Date().getMonth(); // Get the index of the current month (0-11)
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const labels = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12; 
    labels.push(monthNames[monthIndex]);
  }

  new Chart(lineChart, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'month expenses',
        data: [1200, 1900, 1300, 1544, 2144, 1453],
      }]
    },
  });
});


let barChart;
onMount(async () => {
  const currentDay = new Date().getDay(); // Get the index of the current month (0-11)
  const dayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const labels = [];
  for (let i = 6; i >= 0; i--) {
    const dayIndex = (currentDay - i + 7) % 7; 
    labels.push(dayNames[dayIndex]);
  }

  new Chart(barChart, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'weekly expenses',
        data: [786, 456, 345, 576, 435, 567,678],
        borderWidth: 2,
        borderRadius: Number.MAX_VALUE,
        borderSkipped: false,
      }]
    },
  });
});
</script>

<container class="flex justify-around content-center">
    <div class="rounded-box place-items-center w-[50%] h-[80%] flex flex-wrap justify-around content-stretch">
        <div class="rounded-box w-[100%] h-80 bg-secondary overflow-scroll m-2 drop-shadow-lg">
          <form on:submit|preventDefault={uploadExpenses}>
            <table class="table table-pin-rows font-mono">
              <!-- head -->
              <thead>
                <tr>
                  <th>
                    <div>
                      <button type="button" onclick="addRow()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                      </button>
                    </div>
                  </th>
                  <th class="font-bold text-xl">Category</th>
                  <th class="font-bold text-xl">Amount</th>
                  <th class="font-bold text-xl">Date</th>
                </tr>
              </thead>
              <tbody id="expenseRows">
                <!-- row 1 -->
                <tr>
                  <th>1</th>
                  <td>
                    <div class="dropdown dropdown-bottom flex flex-start">
                      <select name="category" class="select select-bordered w-32">
                        <option disabled selected>category</option>
                        <option>Food</option>
                        <option>Gas</option>
                        <option>rent</option>
                        <option>transport</option>
                        <option>entertainment</option>
                        <option>clothes</option>
                        <option>subscription</option>
                        <option>others</option>
                      </select>
                    </div>
                  </td>
                  <td><input name="amount" type="text" placeholder="99.99" class="input input-bordered input-primary w-24 max-w-xs" /></td>
                  <td><input name="date" type="date" class="input input-bordered input-primary w-32" /></td>
                </tr>
                <!-- row 2 -->
                <tr>
                  <th>2</th>
                  <td>
                    <div class="dropdown dropdown-bottom flex flex-start">
                      <label>
                        <select name="category" class="select select-bordered w-32">
                          <option disabled selected class="w-auto">category</option>
                          <option>Food</option>
                          <option>Gas</option>
                          <option>rent</option>
                          <option>transport</option>
                          <option>entertainment</option>
                          <option>clothes</option>
                          <option>subscription</option>
                          <option>others</option>
                        </select>
                      </label>
                    </div>
                  </td>
                  <td><input name="amount" type="text" placeholder="99.99" class="w-24 input input-bordered input-primary max-w-xs" /></td>
                  <td><input name="date" type="date" class="input input-bordered input-primary w-32" /></td>
                </tr>
                <!-- row 2 -->
                <tr>
                    <th>3</th>
                    <td>
                      <div class="dropdown dropdown-bottom flex flex-start">
                        <label>
                          <select name="category" class="select select-bordered w-32">
                            <option disabled selected class="w-auto">category</option>
                            <option>Food</option>
                            <option>Gas</option>
                            <option>rent</option>
                            <option>transport</option>
                            <option>entertainment</option>
                            <option>clothes</option>
                            <option>subscription</option>
                            <option>others</option>
                          </select>
                        </label>
                      </div>
                    </td>
                    <td><input name="amount" type="text" placeholder="99.99" class="w-24 input input-bordered input-primary max-w-xs" /></td>
                    <td><input name="date" type="date" class="input input-bordered input-primary w-32" /></td>
                  </tr>
              </tbody>
            </table>
            <div class="flex content-center justify-center align-middle items-center m-2 ">
                <button type="submit" class="btn drop-shadow-lg">Submit</button>
            </div>
          </form>
        </div>
        
        <div class="rounded-box w-[47%] h-80 bg-secondary overflow-scroll m-2 drop-shadow-lg">
            <div class="bg-secondary text-primary-content">
  
                <div class="stat">
                  <div class="stat-title">Total Spend this month</div>
                  <div class="stat-value">$89,400</div>
                  <div class="stat-actions">
                    <a class="btn btn-sm" href='/history'>View transaction history</a>
                  </div>
                </div>
                
                <div class="stat">
                  <div class="stat-title">Total Saving</div>
                  <div class="stat-value">$89,400</div>
                  <div class="stat-actions">
                    <button class="btn btn-sm">Post to community</button> 
                  </div>
                </div>
                
              </div>
        </div>

        <div class="carousel rounded-box w-[47%] h-80 bg-secondary overflow-scroll m-2 drop-shadow-lg">
            <!-- svelte-ignore a11y-no-interactive-element-to-noninteractive-role -->
            <div class="carousel-item w-full flex items-center">
                <canvas id="pieChart" class="w-full h-full" bind:this={pieChart}></canvas>
            </div>
            <div class="carousel-item w-full ml-4 flex items-center">
                <canvas id="lineChart" class="w-full h-full border-primary" bind:this={lineChart}></canvas>
            </div> 
            <div class="carousel-item w-full flex items-center">
                <canvas id="barChart" class="w-full h-full border-primary" bind:this={barChart}></canvas>
            </div> 
        </div>
    </div>

    <div class="rounded-box place-items-center w-[45%] h-[100%] flex flex-wrap bg-primary">
        <table class="table table-pin-rows font-mono h-[100%]">
            <!-- head -->
            <thead>
              <tr>
                <th class="font-bold text-xl">Bank</th>
                <th class="font-bold text-xl">Category</th>
                <th class="font-bold text-xl">Cash-back percentage</th>
              </tr>
            </thead>
            <tbody id="expenseRows">
              <!-- row 1 -->
              <tr>
                <td>
                    <div class="dropdown dropdown-bottom flex flex-start">
                        <select class="select select-bordered w-32">
                            <option disabled selected>banks</option>
                            <option>Discover</option>
                            <option>Chase Unlimited</option>
                            <option>Bank of America</option>
                        </select>
                    </div>
                </td>
                <td>
                    <select class="select select-bordered w-32">
                        <option disabled selected class="w-auto">category</option>
                        <option>Food</option>
                        <option>Gas</option>
                        <option>rent</option>
                        <option>transport</option>
                        <option>entertainment</option>
                        <option>clothes</option>
                        <option>subscription</option>
                        <option>others</option>
                    </select>
                </td>
                <td><input type="text" placeholder="10/99" class="input input-bordered input-primary w-24 max-w-xs" /></td>
              </tr>
              <!-- row 2 -->
              <tr>
                <td>
                    <div class="dropdown dropdown-bottom flex flex-start">
                        <label>
                            <select class="select select-bordered w-32">
                                <option disabled selected class="w-auto">banks</option>
                                <option>Discover</option>
                                <option>Chase Unlimited</option>
                                <option>Bank of America</option>
                            </select>
                        </label>
                    </div>
                </td>
                <td>
                    <select class="select select-bordered w-32">
                        <option disabled selected class="w-auto">category</option>
                        <option>Food</option>
                        <option>Gas</option>
                        <option>rent</option>
                        <option>transport</option>
                        <option>entertainment</option>
                        <option>clothes</option>
                        <option>subscription</option>
                        <option>others</option>
                    </select>
                </td>
                <td><input type="text" placeholder="10/99" class="w-24 input input-bordered input-primary max-w-xs" /></td>
              </tr>
            </tbody>
          </table>
    </div>
</container>


