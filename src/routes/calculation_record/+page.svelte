<script>
    export let data;
    import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
    import { getTokenFromLocalStorage} from '../../utils/auth.js';
    import { goto } from '$app/navigation';
    let startDate;
    let time;
    let duration;
    let formattedEndDate;
    let formattedStartDate;

    //function to delete specific record//
    async function deleteRecord(id){
        const response = await fetch(`${PUBLIC_BACKEND_BASE_URL}/calculation-record/${id}`, {
        method: 'DELETE',
        mode: 'cors',
      });

      if(response.ok){
        data.record = data.record.filter((record) => record.id != id);
      }
    }

    //function to get formatted date for start and end date//
    function setDate(){
        const goalStartDate = new Date(startDate);
        const goalEndDate = new Date(goalStartDate.getFullYear(),
        goalStartDate.getMonth() + duration, goalStartDate.getDate());

        const startYear = goalStartDate.getFullYear();
        const startMonth = (goalStartDate.getMonth() + 1).toString().padStart(2, '0');
        const startDay = goalStartDate.getDate().toString().padStart(2, '0');

        const endYear = goalEndDate.getFullYear();
        const endMonth = (goalEndDate.getMonth() + 1).toString().padStart(2, '0');
        const endDay = goalEndDate.getDate().toString().padStart(2, '0');

        formattedStartDate = `${startYear}-${startMonth}-${startDay}`
        formattedEndDate = `${endYear}-${endMonth}-${endDay}`;

        return formattedStartDate, formattedEndDate
    };

    //get the calculation-record table data according to calculation-record table id//
    async function getData(id) {
    const response = await fetch(`${PUBLIC_BACKEND_BASE_URL}/calculation-record/${id}`, {
        method: 'GET',
        mode: 'cors',
    });

      if (response.ok) {
          const data = await response.json();
          return data;
      } else {
        throw new Error('An error occurred while fetching the data');
      }
    }

    //function to post data into database (set goal table)//
    async function setTracker(id){
        const goalData = await getData(id)
        time = goalData.duration
        duration = parseInt(time, 10);
        setDate();
        const set_goal_record = {
			      title: goalData.title,
            incomePerMonth: goalData.incomePerMonth, 
            expensesPerMonth: goalData.expensesPerMonth, 
            balancePerMonth: goalData.balancePerMonth,
            totalSaving: goalData.totalSaving,
            duration: time,
            savingsPerMonth: goalData.savingsPerMonth,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            expenseCategories: goalData.expenseCategories.map((category) => ({
                name: category.name,
                value: category.value,
            })),
        	};

          const token = getTokenFromLocalStorage();

          const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/set-goal', {
		            method: 'POST',
		            mode: 'cors',
		            headers: {
			          'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
		            },
		        body: JSON.stringify(set_goal_record)
	        });
          if(resp.status == 200){
            goto('/');
          }
      }
</script>

<!-- Details Summary window -->
<div class="grid grid-cols-3">
{#each data.record as history, index}
<div class="m-5 border rounded-xl w-96 bg-emerald-100 p-3">
<div class="flex justify-between">
<h1 class="p-2 text-lg underline underline-offset-8">Details Summary</h1>
<div>
<div class="tooltip tooltip-top tooltip-primary" data-tip="delete">
    <button class="btn btn-error rounded-full w-12 h-12" on:click={deleteRecord(history.id)}>
        <img src="delete.png" alt="red delete" width="30px" height="30px"/>
    </button>
</div>
<div
  class="tooltip tooltip-top tooltip-primary"
  onclick={`document.getElementById('my_modal_${index}').showModal()`}
  data-tip="set saving goal"
>
    <button class="btn btn-warning rounded-full w-12 h-12">
        <img src="goal.png" alt="goal" width="30px" height="30px"/>
    </button>
</div>
</div>
</div>
    <div class="mt-4 p-2">
    <table class="table-auto">
        <tbody>
            <tr>
                <td class="pr-4">Saving plan title:</td>
                <td>{history.title}</td>
            </tr>
            <tr>
                <td class="pr-4">Estimate income per month:</td>
                <td>$ {history.incomePerMonth}</td>
            </tr>
            <tr>
                <td class="pr-4">Total expenses per month:</td>
                <td>$ {history.expensesPerMonth}</td>
            </tr>
            <tr>
                <td class="pr-4">Balance per month:</td>
                <td class="font-bold">$ {history.balancePerMonth}</td>
            </tr>
            <tr>
                <td class="pr-4">Target saving amount:</td>
                <td>$ {history.totalSaving}</td>
            </tr>
            <tr>
                <td class="pr-4">Estimate time to achieve the target:</td>
                <td>{history.duration}</td>
            </tr>
            <tr>
                <td class="pr-4">Target need to save per month:</td>
                <td class="font-bold">$ {history.savingsPerMonth}</td>
            </tr>
        </tbody>
        </table>
    </div> 
</div>
{/each}
</div>

<!-- show set time window after button is clicked-->
{#each data.record as record, index}
<dialog id={`my_modal_${index}`} class="modal">
  <form method="dialog" class="modal-box bg-neutral text-neutral-content">
    <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    <div class="card-body items-center text-center">
      <h2 class="card-title">Before we set goal tracker....</h2>
      <p>Kindly set the start time</p>
      <input
        name="date"
        type="date"
        class="input input-bordered input-primary w-40"
        bind:value={startDate}
      />
      <div class="card-actions justify-end">
        <button
          class="btn btn-accent"
          on:click={() => setTracker(record.id)}
        >
          Set Goal Tracker
        </button>
      </div>
    </div>
  </form>
</dialog>
{/each}
