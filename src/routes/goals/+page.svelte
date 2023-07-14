<script>
import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public'; 
import { getTokenFromLocalStorage} from '../../utils/auth.js';
import { goto } from '$app/navigation';

let modal;
let startDate;
let formattedEndDate;
let formattedStartDate;
let time;
let income = '';
let total_expenses = '';
let balance_per_month = '';
let Goal_Title = '';
let finalSavings = '';
let totalSaving = '';
let durationType = 'select duration';
let duration = '';
let categories = [{name: "food", value:""},
                  {name: "rent", value:""},
                  {name: "transport", value:""},
                  {name: "gas", value:""},
                  {name: "entertainment", value:""}];


    //function to add expense category//
    function addCategory(){
        categories = [ ...categories, {name: "", value: ""}];
    }

    //function to delete expense category//
    function deleteCategory(index){
        categories = categories.filter((_,i) => i !=index);
    }

    //function to total up the expenses value//
     function calculateTotal(){
        let result = categories.reduce((sum, categories) => sum + (categories.value || 0), 0)
        return result;
     }

    //function to calculate money that need to save per month//
    function calculateSavings(){
        time = getDuration(duration, durationType);
        total_expenses = calculateTotal();
        balance_per_month = income - total_expenses
        finalSavings = Math.ceil(totalSaving/time);
        return finalSavings, balance_per_month, total_expenses;
    }

    //function to convert year to month//
    function getDuration(duration, durationType){
        switch(durationType){
            case 'month': return duration;
            case 'year': return duration * 12;
            default: return 0;
        }
    }

    //function to get formatted start and end goal date//
    export function setDate(){
        const goalStartDate = new Date(startDate);
        const goalEndDate = new Date(goalStartDate.getFullYear(),
        goalStartDate.getMonth() + time, goalStartDate.getDate());

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

    //function to post calculation result to the database (set goal table)//
    async function setGoalRecord(){
        setDate();
        time = duration + ' ' + durationType
        const set_goal_record = {
			title: Goal_Title,
            incomePerMonth: income, 
            expensesPerMonth: total_expenses, 
            balancePerMonth: balance_per_month,
            totalSaving: totalSaving,
            duration: time,
            savingsPerMonth: finalSavings,
            start_date: formattedStartDate,
            end_date: formattedEndDate,
            expenseCategories: categories
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

//function to post calculation result to the database (calculationRecord table)//
    async function setCalculationRecord(){
        setDate();
        time = duration + ' ' + durationType
        const set_calculation_record = {
			title: Goal_Title,
            incomePerMonth: income, 
            expensesPerMonth: total_expenses, 
            balancePerMonth: balance_per_month,
            totalSaving: totalSaving,
            duration: time,
            savingsPerMonth: finalSavings,
            expenseCategories: categories
		};

    const token = getTokenFromLocalStorage();

    const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/calculation-record', {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(set_calculation_record)
	});

    if(resp.status == 200){
        goto("/calculation_record");
    }
}
</script>

<!-- Saving Calculator -->
<h1 class="text-center text-xl mt-4">Saving Plan Calculator</h1>
<div class="grid justify-center mt-8">
    <form class="w-auto p-2 border rounded-xl m-2">
    <!-- Saving Title input section -->
    <div class="flex flex-col">
        <div class="mb-4 flex items-center">
            <label for="savingTitle" class="w-52">
                <span class="label-text text-base">Title:</span>
            </label>
            <div class="border border-gray-300 rounded-xl inline-flex flex-grow">
                <input type="text" name="savingTitle" placeholder="The purpose of saving? Eg: Saving for buy house." class="input focus:outline-none w-96 border rounded-xl" 
                bind:value={Goal_Title}/>
            </div>
        </div>

        <!--Target saving amount input section-->
        <div class="mb-4 flex items-center">
            <label for="target-saving-amount" class="w-52">
                <span class="label-text text-base">Target savings amount:</span>
            </label>

            <div class="border border-gray-300 rounded-xl inline-flex flex-grow">
                <span class="p-2 mt-1 text-gray-500">$</span>
                    <input type="number" name="target-saving-amount" class="input focus:outline-none w-44 p-2" 
                    bind:value={totalSaving} />
            </div>
        </div>

        <!--Time to achieve saving goal section-->
        <div class="mb-4 flex items-center">
            <label for="time-to-achieve" class="w-52">
                <span class="label-text text-base">Time to achieve the goal:</span>
            </label>

        <div class="border border-gray-300 rounded-xl inline-flex flex-grow">
            <select class="bg-transparent outline-none p-2 w-auto" bind:value={durationType}>
                <option disabled selected>select duration</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
            </select>
            <input type="number" name="time-to-achieve" class="input focus:outline-none w-44 p-2" bind:value={duration} />
        </div>
    </div>

    <!-- Estimate income per month -->
    <div class="mb-4 flex relative items-center">
        <label for="expenses" class="w-52">
            <span class="label-text text-base">Estimate income per month:</span>
        </label>

        <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-10">
                <span class="text-gray-500 sm:text-sm">$</span>
            </div>
            <input type="number" name="incomeValue" 
            class="input border border-gray-300 rounded-xl focus:outline-none w-96 pl-20"
            bind:value={income}/>
        </div>
    </div>

    <!--Expenses on each categories section-->
    <div class="mb-4 flex relative">
        <label for="expenses" class="w-52">
            <span class="label-text text-base">Expenses on each category per month:</span>
        </label>

        <div id ="categoryDiv" class="border border-gray-300 rounded-xl inline-flex w-96 flex-col overflow-y-auto max-h-auto">
            <ul>
            {#each categories as category, index}
                <li class="p-2 flex items-center">
                <!-- input category -->
                    <input type="text" name="categoryName" 
                    class="input border border-gray-300 rounded-xl flex-grow focus:outline-none w-36 mr-2"
                    placeholder="category" bind:value={category.name}/> : 

                <!-- input expense value for particular category -->
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none w-10">
                        <span class="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input type="number" name="categoryValue" 
                    class="input border border-gray-300 rounded-xl flex-grow focus:outline-none w-44 ml-1 pl-20"
                    bind:value={category.value}/>
                </div>

                <button on:click|preventDefault={()=> deleteCategory(index)} class="text-black rounded-xl w-8 h-8 m-2 btn-primary">🗑️</button>
            </li>
            {/each}
            </ul>
            <button class="text-black rounded-xl w-26 h-10 m-2 btn btn-primary" on:click|preventDefault={addCategory}>Add more</button>
        </div> 
    </div>

    <!-- Calculation button -->
    <div class="grid justify-items-center mt-10">
        <button class="btn btn-primary w-60 h-10 rounded-xl" on:click|preventDefault={() => {
        calculateSavings();
        modal.showModal();
        }}>calculate</button>
    </div>
    </form>
</div>

<!-- Details Summary window -->
<dialog id="my_modal_4" bind:this={modal} class="modal">
    <form method="dialog" class="modal-box text-neutral-content">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        <h1 class="p-2 text-lg underline underline-offset-8">Details Summary</h1>
        <div class="mt-4 p-2">
            <table class="table-auto">
                <tbody>
                    <tr>
                        <th class="pr-4">Saving plan title:</th>
                        <td>{Goal_Title}</td>
                    </tr>
                    <tr>
                        <th class="pr-4">Estimate income per month:</th>
                        <td>$ {income}</td>
                    </tr>
                    <tr>
                        <th class="pr-4">Total expenses per month:</th>
                        <td>$ {total_expenses}</td>
                    </tr>
                    <tr>
                        <th class="pr-4">Balance per month:</th>
                        <td class="font-bold">$ {balance_per_month}</td>
                    </tr>
                    <tr>
                        <th class="pr-4">Target saving amount:</th>
                        <td>$ {totalSaving}</td>
                    </tr>
                    <tr>
                        <th class="pr-4">Estimate time to achieve the target:</th>
                        <td>{duration} {durationType}</td>
                    </tr>
                    <tr>
                        <th class="pr-4">Target need to save per month:</th>
                        <td class="font-bold">$ {finalSavings}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="flex justify-center m-2">
            <button class="btn-neutral m-2 p-2 rounded-xl w-20 h-10" on:click={setCalculationRecord}>Save</button>
            <button class="btn-neutral m-2 p-2 rounded-xl w-36 h-10" onclick="my_modal_3.showModal()">Set Goal Tracker</button>
        </div>
</form>
</dialog>

<!-- show set time window -->
<dialog id="my_modal_3" class="modal">
    <form method="dialog" class="modal-box bg-neutral text-neutral-content">
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            <div class="card-body items-center text-center">
                <h2 class="card-title">Before we set goal tracker....</h2>
                <p>Kindly set the start time</p>
                <input name="date" type="date" 
                class="input input-bordered input-primary w-40"
                bind:value={startDate}>
                <div class="card-actions justify-end">
                    <button class="btn btn-accent" on:click={setGoalRecord}>Set Goal Tracker</button>
                </div>
            </div>
    </form>
</dialog>