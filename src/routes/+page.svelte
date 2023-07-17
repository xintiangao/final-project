<!-- // Xintian -->
<svelte:head>
  <script src="/aws-sdk-s3.min.js"></script>
</svelte:head>
<script>
  import Chart from 'chart.js/auto'
  import createObserverPlugin from './observer-plugin.js';
  import { onMount, afterUpdate} from 'svelte';
  import html2canvas from 'html2canvas';
  import { uploadExpenses,  uploadIncome, CalculateTotalSaving } from './utils.js'
  import { getUserId, getTokenFromLocalStorage} from "../utils/auth"
  import { uploadMedia, generateFileWithUniqueName } from "../utils/s3-uploader.js"
  import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';


  let expenseData = [];
  let incomeData = [];
  let goalData = [];
  let goalAmount = [];
  let incomeRows = [];
  let expenseRows = [];
  let rowCounter = 1;
  let expenseRow = 1;
  let userId = getUserId();
  let pieChartUrl  = '';
  let fileName;
  let index = 0;
  let selectedCategory = ""; 
  let cashbackPercentage = ""; 



export function addIncomeRow() {
  incomeRows = [...incomeRows, {}];
  rowCounter++;
}
export function addRow() {
  expenseRows = [...expenseRows, {}];
  expenseRow++;
}

  async function fetchExpenseData() {
    expenseData = await fetch(PUBLIC_BACKEND_BASE_URL + `/expense-input/${userId}`).then((response) => response.json());
  }

  async function fetchIncomeData() {
    incomeData = await fetch(PUBLIC_BACKEND_BASE_URL + `/income-input/${userId}`).then((response) => response.json());
  }

  // async function fetchGoalData() {
  //   goalData = await fetch(PUBLIC_BACKEND_BASE_URL + `/set-goal/${userId}`).then((response) => response.json());
  // }

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
    goalAmount = goalData.map((item) => item.totalSaving);
    return goalData, goalAmount;
  }).catch((error) => {
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

  async function capturePieChart() {
    const canvas = await html2canvas(document.getElementById('pieChart'));
    pieChartUrl = canvas.toDataURL('image/png');
    console.log('Pie chart captured:', pieChartUrl);
  }

  async function uploadPieChart() {
    fileName ='example-file.png';
    const response = await fetch(pieChartUrl);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });

    const [fileUrl, uploadedFileName] = await uploadMedia(file);
    console.log('Pie chart uploaded:', fileUrl);
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
          onAnimationComplete: {
            onComplete: capturePieChart()
          }
        },
        plugins: [createObserverPlugin(capturePieChart)],
      });
      await capturePieChart();
      await uploadPieChart();
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


function handleCategoryChange(event, bankIndex) {
  selectedCategory = event.target.value.toLowerCase();
  setCategory(selectedCategory);

  for (let i = bankIndex + 1; i <= 3; i++) {
    const categorySelectId = `categorySelect${i}`;
    const categorySelectElement = document.getElementById(categorySelectId);
    categorySelectElement.value = selectedCategory;
  }
}


  function handleCategoryHeaderChange(event) {
    selectedCategory = event.target.value.toLowerCase();

    for (let i = 1; i <= 3; i++) {
      const categorySelectId = `categorySelect${i}`;
      const categorySelectElement = document.getElementById(categorySelectId);
      categorySelectElement.value = selectedCategory;
    }
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
      } else if (category === "dining" || category === "drug store") {
        return "3%";
      } else {
        return "1.5%";
      }
    } else if (bank === "BOA") {
      if (category === "gas") {
        return "3%";
      } else if (category === "grocery") {
        return "2%";
      } else {
        return "1%";
      }
    } else {
      return "";
    }
  }

async function postToCommunity() {
  const totalSpend = calculateTotal(expenseData);
  const totalSaving = CalculateTotalSaving(expenseData, incomeData);
  const userId = parseInt(getUserId());
  const chartData = await html2canvas(document.getElementById('pieChart')).then((canvas) => canvas.toDataURL('image/png'));

  const postData = {
    userId: userId,
    totalSpend,
    totalSaving,
    chartData,
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

let finalAmount = 0;
let total_savings = 0;
//function to get the goal percentage//
async function getSetGoalPercentage() {
  await fetchExpenseData();
  await fetchIncomeData();
  total_savings = CalculateTotalSaving(expenseData, incomeData) * 0.1;
  finalAmount = Math.round((total_savings / goalAmount[goalAmount.length - 1]) * 100);
  return { finalAmount, total_savings };
}

let progressValue = 0;
let currentSavingAmount = 0;
async function updateProgressValue() {
  const { finalAmount, total_savings } = await getSetGoalPercentage();
  currentSavingAmount = Math.round(total_savings);
  progressValue = finalAmount;
  return progressValue, currentSavingAmount;
}

onMount(updateProgressValue);

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
                  <button type="button"  on:click={addRow}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            {#each Array.from({ length: expenseRow }) as _, index}
            <!-- row 1 -->
            <tr>
              <th>{index + 1}</th>
              <td>
                <div class="dropdown dropdown-bottom flex flex-start">
                  <select name={`category_${index}`} class="select select-bordered w-32">
                    <option disabled selected>category</option>
                    {#each ['Clothes', 'Dining', 'Drug Store', 'Entertainment', 'Gas', 'Grocery', 'Others', 'Rent', 'Subscription', 'Transport', 'Travel'] as option}
                    <option value={option.toLowerCase()}>{option}</option>
                    {/each}
                  </select>
                </div>
              </td>
              <td><input name={`amount_${index}`} type="text" placeholder="99.99" class="input input-bordered input-primary w-24 max-w-xs" /></td>
              <td><input name={`date_${index}`} type="date" class="input input-bordered input-primary w-32" /></td>
              <td><input name={`note_${index}`} type="text" placeholder="Note" class="input input-bordered input-primary w-28 max-w-xs" /></td>
            </tr>
            {/each}
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
          <div class="stat-value">${CalculateTotalSaving(expenseData, incomeData)}</div>
          <div class="stat-actions">
            <a class="btn btn-sm" href='/community' on:click={postToCommunity}>Post to community</a> 
          </div>
        </div>
        </div>
      </div>
      
<div class="carousel-item w-full h-full flex flex-col justify-center items-center bg-secondary">
    <div class="h-96 carousel carousel-vertical rounded-box">
      {#each goalData as goal_data, index}
      {#if index === goalData.length - 1 }
      <div class="bg-secondary rounded-lg shadow-md p-2 carousel-item h-full flex flex-col">

    <div class="stat h-auto overflow-y-scroll">
  <h1 class="text-center text-3xl font-bold mb-4">Saving Goal Tracker</h1>
  <h1 class="text-center text-lg stat-title underline mb-2">{goal_data.title}</h1>
  <div class="bg-white p-4 rounded-xl mb-4">
    <table class="table-auto">
      <tbody>
        <tr>
          <td class="pr-4">Target saving amount:</td>
          <td class="text-cyan-400">$ {goal_data.totalSaving}</td>
        </tr>
        <tr>
          <td class="pr-4">Time:</td>
          <td class="font-bold text-sky-900">{goal_data.start_date} TO {goal_data.end_date}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="flex justify-center items-center">
      <div class="tooltip inline-block" data-tip="Total accumulate saving amount: ${currentSavingAmount}">
  <div class="radial-progress bg-white text-white bg-gradient-to-r from-lime-400 to-green-500 border-4 mx-auto mb-2 mt-2" style="--value:{progressValue}; --size:8rem; --thickness:10px;">
    <p class="text-center text-lg font-bold mt-4">{progressValue}%</p>
  </div>
</div>

    </div>
  </div>
</div>
       {/if}
    {/each}
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
  <div class="rounded-box place-items-center w-[100%] h-auto flex flex-wrap bg-primary drop-shadow-lg mb-2 mt-2">
    <table id="bankTable" class="table table-pin-rows font-mono h-[100%]">
      <!-- head -->
      <thead>
        <tr>
          <th class="font-bold text-xl">Bank</th>
          <th class="font-bold text-xl">
            <select id="categorySelectHeader" class="select select-bordered w-40 text-xl" on:change={(event) => handleCategoryHeaderChange(event)}>
              <option disabled selected >Category</option>
              {#each ['Clothes', 'Dining', 'Drug Store', 'Entertainment', 'Gas', 'Grocery', 'Others', 'Rent', 'Subscription', 'Transport', 'Travel'] as option}
                <option value={option.toLowerCase()}>{option}</option>
              {/each}
            </select>
          </th>
          <th class="font-bold text-xl">Cash-back %</th>
        </tr>
      </thead>
      <tbody id="bankRows">
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
            <span id="cashbackPercentage1" class="font-bold text-xl">{getCashbackPercentage("Discover", selectedCategory)}</span>
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
            <span id="cashbackPercentage2" class="font-bold text-xl">{getCashbackPercentage("Chase Unlimited", selectedCategory)}</span>
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
            <span id="cashbackPercentage3" class="font-bold text-xl">{getCashbackPercentage("BOA", selectedCategory)}</span>
          </td>
        </tr>
      </tbody>      
    </table>
  </div>

  <div class="rounded-box place-items-center w-full h-80 bg-primary mr-2 mt-5 drop-shadow-lg overflow-scroll">
    <form on:submit|preventDefault={uploadIncome}>
      <table class="table table-pin-rows font-mono">
        <!-- head -->
        <thead>
          <tr>
            <th>
              <div>
                <button type="button" on:click={addIncomeRow}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          {#each Array.from({ length: rowCounter }) as _, index}
            <tr>
              <th>{index + 1}</th>
              <td>
                <div class="dropdown dropdown-bottom flex flex-start">
                  <select name={`income_${index}`} class="select select-bordered w-32">
                    <option disabled selected>income</option>
                    {#each ['salary', 'gift', 'stocks', 'rent', 'sales', 'others'] as option}
                      <option value={option.toLowerCase()}>{option}</option>
                    {/each}
                  </select>
                </div>
              </td>
              <td><input name={`incomeAmount_${index}`} type="text" placeholder="99.99" class="input input-bordered input-primary w-24 max-w-xs" /></td>
              <td><input name={`date_${index}`} type="date" class="input input-bordered input-primary w-32" /></td>
              <td><input name={`note_${index}`} type="text" placeholder="Note" class="input input-bordered input-primary w-28 max-w-xs" /></td>
            </tr>
          {/each}
        </tbody>
      </table>
      <div class="flex content-center justify-center align-middle items-center m-2">
        <button type="submit" class="btn drop-shadow-lg">Submit</button>
      </div>
    </form>
  </div>
  
</div>
</container>

