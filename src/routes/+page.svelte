<!-- // Xintian -->
<script>
  import Chart from 'chart.js/auto'
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { addRow, uploadExpenses } from './utils.js'
  import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
  
  let expenseData = [];

  async function fetchExpenseData() {
    expenseData = await fetch(PUBLIC_BACKEND_BASE_URL + `/expense-input`).then((response) => response.json());
  }

  onMount(fetchExpenseData);

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
      console.log(data)
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

  let cashbackPercentage = ""; // Initialize the cashbackPercentage variable

  // Function to handle category change event
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
    
    <div class="rounded-box w-[47%] h-80 bg-secondary overflow-scroll m-2 drop-shadow-lg">
      <div class="bg-secondary text-primary-content">
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
  <div class="rounded-box place-items-center w-[45%] h-[100%] flex flex-wrap bg-primary m-2 drop-shadow-lg">
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
</container>
