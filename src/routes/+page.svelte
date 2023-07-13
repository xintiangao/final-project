<!-- // Xintian -->
<script>
  import Chart from 'chart.js/auto'
  import { onMount } from 'svelte';
  import { addRow, uploadExpenses, addIncomeRow, uploadIncome, data } from './utils.js'
  import { getUserId, getTokenFromLocalStorage } from "../utils/auth"
  import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';

  let expenseData = [];
  let incomeData =[];
  let goalData = [];

  async function fetchExpenseData() {
    expenseData = await fetch(PUBLIC_BACKEND_BASE_URL + `/expense-input`).then((response) => response.json());
  }

  async function fetchIncomeData() {
    incomeData = await fetch(PUBLIC_BACKEND_BASE_URL + `/income`).then((response) => response.json());
  }

  let token = getTokenFromLocalStorage()
  async function fetchSetGoalData(){
    const res = await fetch(PUBLIC_BACKEND_BASE_URL + `/set-goal`,{
        method: 'GET',
        mode: 'cors',
        headers: {
			'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
		},
    })
    const resp = await res.json();
    return resp;
  }
  onMount(fetchExpenseData);
  onMount(fetchIncomeData);

  fetchSetGoalData()
  .then((data) => {
    goalData = data;
    console.log(goalData);
    return goalData;
    // Use the retrieved data as needed
  })
  .catch((error) => {
    console.log('Error:', error);
  });

function calculateTotal(expenses) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  let total = 0;
  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    const expenseMonth = expenseDate.getMonth();
    const expenseYear = expenseDate.getFullYear();

    if (expenseMonth === (currentMonth) && expenseYear === currentYear) {
      total += expense.amount;
    }
  });

  return total;
}

function calculateIncome(incomeData) {
  let totalIncome = 0;

  incomeData.forEach((income) => {
    const salary = income.monthlyincome || 0;
    const others = income.otherincome || 0;
    totalIncome += salary + others;
  });

  return totalIncome;
}



  function calculateTotalForThreeMonths(expenses) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const previousMonth1 = (currentMonth - 1 + 12) % 12;
    const previousMonth2 = (currentMonth - 2 + 12) % 12;

    let total = 0;
    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = expenseDate.getMonth();
      const expenseYear = expenseDate.getFullYear();

      if (
        (expenseYear === currentYear && expenseMonth === currentMonth) ||
        (expenseYear === currentYear && expenseMonth === previousMonth1) ||
        (expenseYear === currentYear && expenseMonth === previousMonth2) ||
        (expenseYear === currentYear - 1 && expenseMonth === 11 && currentMonth === 0) ||
        (expenseYear === currentYear - 1 && expenseMonth === 10 && currentMonth === 11)
      ) {
        total += expense.amount;
      }
    });

    return total;
  }

  let pieChart;
  onMount(
    async () => {
      await fetchExpenseData();

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const labelsMap = new Map();
      expenseData.forEach((expense) => {
        const expenseDate = new Date(expense.date);
        const expenseMonth = expenseDate.getMonth();
        const expenseYear = expenseDate.getFullYear();

        if (expenseMonth === currentMonth && expenseYear === currentYear) {
          const category = expense.category;
          const amount = expense.amount;
          if (labelsMap.has(category)) {
            const currentAmount = labelsMap.get(category);
            labelsMap.set(category, currentAmount + amount);
          } else {
            labelsMap.set(category, amount);
          }
        }
      });

      const labels = Array.from(labelsMap.keys());
      const data = Array.from(labelsMap.values());

      new Chart(pieChart, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            label: 'month expenses',
            data: data,
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
  );

  let lineChart;
  onMount(async () => {

    await fetchExpenseData();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); 
    const currentYear = currentDate.getFullYear();
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
    const data = [];

    for (let i = 2; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = monthNames[monthIndex];

      const filteredExpenses = expenseData.filter((expense) => {
        const expenseDate = new Date(expense.date);
        const expenseMonth = expenseDate.getMonth();
        const expenseYear = expenseDate.getFullYear();
        return (
          (expenseYear === currentYear && expenseMonth === monthIndex) ||
          (expenseYear === currentYear - 1 && expenseMonth === 11 && monthIndex === 0) ||
          (expenseYear === currentYear - 1 && expenseMonth === 10 && monthIndex === 11)
        );
      });

      const totalAmount = calculateTotalForThreeMonths(filteredExpenses);
      labels.push(monthName);
      data.push(totalAmount);
    }

    new Chart(lineChart, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'month expenses',
          data: data,
        }]
      },
    });
  });

  function calculateDaily(dayIndex) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dayIndex);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const dailyExpenses = expenseData.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate < endDate;
    });

    const totalExpense = dailyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    // console.log(totalExpense);
    return totalExpense;
  }


  let barChart;

  onMount(async () => {
    await fetchExpenseData();

    const currentDate = new Date();
    const currentDay = currentDate.getDay();
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const labels = [];
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const dayIndex = (currentDay - i + 7) % 7;
      const dayName = dayNames[dayIndex];
      labels.push(dayName);

      const totalAmount = calculateDaily(i);
      data.push(totalAmount);
    }


    new Chart(barChart, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'daily expenses',
          data: data,
          borderRadius: Number.MAX_VALUE,
          borderSkipped: false,
        }]
      },
    });
  });

  let cashbackPercentage = ""; 

  function handleCategoryChange(event, bankIndex) {
    const selectedCategory = event.target.value;
    const bankName = event.target.parentNode.parentNode.querySelector(".font-semibold").textContent.trim();

    const categorySelectId = `categorySelect${bankIndex}`;
    const cashbackPercentageId = `cashbackPercentage${bankIndex}`;

    const categorySelectElement = document.getElementById(categorySelectId);
    const cashbackPercentageElement = document.getElementById(cashbackPercentageId);

cashbackPercentageElement.textContent = getCashbackPercentage(bankName, selectedCategory);
}

function getCashbackPercentage(bank, category) {

  if (bank === "Discover") {
    if (category === "gas") {
      return "5%";
    } else {
      return "1%";
    }
  } else if (bank === "Chase Unlimited") {
    if (category === "travel") {
      return "5%";
    } if (category === "dining" || "drug store") {
      return "3%";
  }  else {
      return "1.5%";
    }
  } else if (bank === "BOA") {
    if (category === "gas") {
      return "3%";
    } if (category === "grocery") {
      return "2%";
    }else {
      return "1%";
    }
  } 
}

async function postToCommunity() {
  const totalSpend = calculateTotal(expenseData);
  const totalSaving = 89400;
  const userId = parseInt(getUserId());

  const postData = {
    userId: userId,
    totalSpend,
    totalSaving,
  };

  try {
    const response = await fetch(PUBLIC_BACKEND_BASE_URL + '/community', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (response && response.status === 201) {
      console.log('Post created successfully!');
    } else {
      console.error('Error creating post:', error);
    }
  } catch (error) {
    console.error('Error creating post:', error);
  }
}

//function to get the goal percentage//
    let total_expenses = 4000;
    let total_savings = 5000;
    let goalAmount = 45000;
    function getSetGoalPercentage(){
      const currentAmount = (total_savings - total_expenses)
      const finalAmount = Math.round((currentAmount / goalAmount) * 100)
      return finalAmount;
    }

    let progressValue = getSetGoalPercentage();

//function to get random color of the goal title//
// export function randomColor() {
//     // Generate a random color class name //
//     var colors = ["red", "orange", "amber", "yellow", "lime", "green",
//                   "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet",
//                   "purple", "fuchsia", "pink", "rose"];
//     var randomColor = colors[Math.floor(Math.random() * colors.length)];

//   //   // Set the goalColor variable to the generated random color class name
//   // document.documentElement.style.setProperty('--goal-color', randomColor);
//   return randomColor;
// }

// let setColor = randomColor()
</script>

<container class="flex justify-around">
  <div class="rounded-box place-items-center w-[50%] h-[80%] flex flex-wrap justify-around content-stretch">
    <div class="rounded-box w-[100%] h-80 bg-secondary overflow-scroll m-2 drop-shadow-lg">
      <form on:submit|preventDefault={uploadExpenses}>
        <table class="table table-pin-rows font-mono">
          <!-- head -->
          <thead>
            <tr>
              <th>
                <div>
                  <button type="button" on:click={addRow}>
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
              <th class="font-bold text-xl">Note</th>
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
                    {#each ['Clothes', 'Dining', 'Drug Store', 'Entertainment', 'Gas', 'Grocery', 'Others', 'Rent', 'Subscription', 'Transport', 'Travel'] as option}
                    <option value={option.toLowerCase()}>{option}</option>
                    {/each}
                  </select>
                </div>
              </td>
              <td><input name="amount" type="text" placeholder="99.99" class="input input-bordered input-primary w-24 max-w-xs" /></td>
              <td><input name="date" type="date" class="input input-bordered input-primary w-32" /></td>
              <td><input name="note" type="text" placeholder="Note" class="input input-bordered input-primary w-28 max-w-xs" /></td>
            </tr>
          </tbody>
        </table>
        <div class="flex content-center justify-center align-middle items-center m-2 ">
          <button type="submit" class="btn drop-shadow-lg">Submit</button>
        </div>
      </form>
    </div>
    
    <div class="carousel rounded-box w-[47%] h-80 bg-secondary overflow-scroll m-2 drop-shadow-lg">
      <div class="carousel-item bg-secondary text-primary-content">
        <div class="w-80">
        <div class="stat">
          <div class="stat-title">Total Spend this month</div>
          <div class="stat-value">${calculateTotal(expenseData)}</div>
          <div class="stat-actions">
            <a class="btn btn-sm" href='/history'>View transaction history</a>
          </div>
        </div>
        
        <div class="stat">
          <div class="stat-title">Total Saving</div>
          <div class="stat-value">${calculateTotal(expenseData)}</div>
          <div class="stat-actions">
            <a class="btn btn-sm" href='/community' on:click={postToCommunity}>Post to community</a> 
          </div>
        </div>
        </div>
      </div>
      
      <div class="carousel-item w-full h-full flex flex-col justify-center items-center bg-blue-100">
    <div class="h-96 carousel carousel-vertical rounded-box">
      <div class="bg-blue-100 rounded-lg shadow-md p-2 carousel-item h-full flex flex-col">
    
    {#each goalData as goal_data}
    <h1 class="text-2xl font-bold my-1 text-center text-orange-500">Saving Goal Tracker</h1>
    <h1 class="text-xl font-bold text-center text-red-400 flex justify-start underline pl-2 mb-1">{goal_data.title}</h1>
        <div class="bg-white p-2 border rounded-xl w-auto h-auto flex justify-center items-center">
          <table class="table-auto">
            <tbody>
              <tr>
                <td class="pr-4">Target saving amount:</td>
                <td class="text-cyan-400">$ {goal_data.totalSaving}</td>
              </tr>
              <tr>
                <td class="pr-4">Time: </td>
                <td class="font-bold text-sky-900">{goal_data.start_date} - {goal_data.end_date}</td>
              </tr>
            </tbody>
          </table>
        </div>
    {/each}

      <div class="flex justify-center items-center">
        <div class="radial-progress bg-white text-lime-400 border-4 mx-auto mb-2 mt-2" style="--value:{progressValue}; --size:7rem; --thickness:10px;">
          <p class="text-center text-lg font-bold mt-4">{progressValue}%</p>
        </div>
      </div>
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

<div class="rounded-box">
  <div class="rounded-box place-items-center w-[100%] h-auto flex flex-wrap bg-primary drop-shadow-lg mb-2">
    <table id="bankTable" class="table table-pin-rows font-mono h-[100%]">
      <!-- head -->
      <thead>
        <tr>
          <th class="font-bold text-xl">Bank</th>
          <th class="font-bold text-xl">Category</th>
          <th class="font-bold text-xl">Cash-back %</th>
        </tr>
      </thead>
      <tbody id="expenseRows">
        <!-- row 1 -->
        <tr>
          <td>
            <div class="flex flex-start">
              <div class="font-semibold text-xl">Discover</div>
            </div>
          </td>
          <td>
            <select id="categorySelect1" class="select select-bordered w-32" on:change={(event) => handleCategoryChange(event, 1)}>
              <option disabled selected class="w-auto">category</option>
              {#each ['Clothes', 'Dining', 'Drug Store', 'Entertainment', 'Gas', 'Grocery', 'Others', 'Rent', 'Subscription', 'Transport', 'Travel'] as option}
                <option value={option.toLowerCase()}>{option}</option>
              {/each}
            </select>
          </td>
          <td>
            <span id="cashbackPercentage1" class="font-bold text-xl">{cashbackPercentage}</span>
          </td>
            
        </tr>
        <!-- row 2 -->
        <tr>
          <td>
            <div class="flex flex-start">
              <div class="font-semibold text-xl">Chase Unlimited</div>
            </div>
          </td>
          <td>
            <select id="categorySelect2" class="select select-bordered w-32" on:change={(event) => handleCategoryChange(event, 2)}>
              <option disabled selected class="w-auto">category</option>
              {#each ['Clothes', 'Dining', 'Drug Store', 'Entertainment', 'Gas', 'Grocery', 'Others', 'Rent', 'Subscription', 'Transport', 'Travel'] as option}
              <option value={option.toLowerCase()}>{option}</option>
              {/each}
            </select>
          </td>
          <td>
            <span id="cashbackPercentage2" class="font-bold text-xl">{cashbackPercentage}</span>
          </td>
        </tr>
        <!-- row 3 -->
        <tr>
          <td>
            <div class="flex flex-start">
              <div class="font-semibold text-xl">BOA</div>
            </div>
          </td>
          <td>
            <select id="categorySelect3" class="select select-bordered w-32" on:change={(event) => handleCategoryChange(event, 3)}>
              <option disabled selected class="w-auto">category</option>
              {#each ['Clothes', 'Dining', 'Drug Store', 'Entertainment', 'Gas', 'Grocery', 'Others', 'Rent', 'Subscription', 'Transport', 'Travel'] as option}
              <option value={option.toLowerCase()}>{option}</option>
              {/each}
            </select>
          </td>
          <td>
            <span id="cashbackPercentage3" class="font-bold text-xl">{cashbackPercentage}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="rounded-box place-items-center w-full h-96 bg-primary mr-2 drop-shadow-lg overflow-scroll">
        <form on:submit|preventDefault={uploadIncome}>
          <table class="table table-pin-rows font-mono">
            <!-- head -->
            <thead>
              <tr>
                <th>
                  <div>
                    <button type="button" on:click={addIncomeRow}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                  </div>
                </th>
                <th class="font-bold text-xl">Income</th>
                <th class="font-bold text-xl">Amount</th>
                <th class="font-bold text-xl">Date</th>
                <th class="font-bold text-xl">Note</th>
              </tr>
            </thead>
            <tbody id="incomeRows">
              <!-- row 1 -->
              <tr>
                <th>1</th>
                <td>
                  <div class="dropdown dropdown-bottom flex flex-start">
                    <select name="income" class="select select-bordered w-32">
                      <option disabled selected>income</option>
                      {#each ['salary','gift', 'stocks', 'rent', 'sales', 'others'] as option}
                      <option value={option.toLowerCase()}>{option}</option>
                      {/each}
                    </select>
                  </div>
                </td>
                <td><input name="incomeAmount" type="text" placeholder="99.99" class="input input-bordered input-primary w-24 max-w-xs" /></td>
                <td><input name="date" type="date" class="input input-bordered input-primary w-32" /></td>
                <td><input name="note" type="text" placeholder="Note" class="input input-bordered input-primary w-28 max-w-xs" /></td>
              </tr>
              <!-- row 2 -->
              <tr>
                <th>2</th>
                <td>
                  <div class="dropdown dropdown-bottom flex flex-start">
                    <select name="income" class="select select-bordered w-32">
                      <option disabled selected>income</option>
                      {#each ['salary','gift', 'stocks', 'rent', 'sales', 'others'] as option}
                      <option value={option.toLowerCase()}>{option}</option>
                      {/each}
                    </select>
                  </div>
                </td>
                <td><input name="incomeAmount" type="text" placeholder="99.99" class="input input-bordered input-primary w-24 max-w-xs" /></td>
                <td><input name="date" type="date" class="input input-bordered input-primary w-32" /></td>
                <td><input name="note" type="text" placeholder="Note" class="input input-bordered input-primary w-28 max-w-xs" /></td>
              </tr>
            </tbody>
          </table>
          <div class="flex content-center justify-center align-middle items-center m-2 ">
            <button type="submit" class="btn drop-shadow-lg">Submit</button>
          </div>
        </form>
      </div>
</div>

</container>


