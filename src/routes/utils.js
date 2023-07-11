import { getTokenFromLocalStorage, getUserId } from "../utils/auth";
import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
import { onMount } from 'svelte';
export let data

let expenseData = [];

async function fetchExpenseData() {
  expenseData = await fetch(PUBLIC_BACKEND_BASE_URL + `/expense-input`).then((response) => response.json());
}


let loading=false;
let formErrors = {};

    let rowCounter = 2;
    export function addRow() {
        rowCounter++;
        const newRow = `
            <tr>
                <th>${rowCounter}</th>
                <td>
                    <div class="dropdown dropdown-bottom flex flex-start">
                        <label>
                            <select class="select select-bordered w-32">
                                <option disabled selected>category</option>
                                {#each ['Clothes', 'Dining', 'Drug Store', 'Entertainment', 'Gas', 'Grocery', 'Others', 'Rent', 'Subscription', 'Transport', 'Travel'] as option}
                                <option value={option.toLowerCase()}>{option}</option>
                                {/each}
                            </select>
                        </label>
                    </div>
                </td>
                <td><input type="text" placeholder="99.99" class="w-24 input input-bordered input-primary max-w-xs" /></td>
                <td><input name="date" type="date" class="input input-bordered input-primary w-32" /></td>
                <td><input name="note" type="text" placeholder="Note" class="input input-bordered input-primary w-28 max-w-xs" /></td>
            </tr>`;
        document.getElementById('expenseRows').insertAdjacentHTML('beforeend', newRow);
    }

    export async function uploadExpenses(evt) {
		evt.preventDefault();
		formErrors = {
        category: '',
        amount: '',
        date:'',
		}; 

		if (!evt.target['category'].value) {
			formErrors.category = 'Please select a category.';
		} else {
			formErrors.category = '';
		}
		if (!evt.target['amount'].value) {
			formErrors.title = 'Please enter an amount.';
		} else {
			formErrors.title = '';
		}
        if (!evt.target['date'].value) {
			formErrors.title = 'Please select a date.';
		} else {
			formErrors.title = '';
		}
		loading=true;

        let userId = parseInt(getUserId())

		const expenseData = {
			category: evt.target['category'].value,
			amount: parseInt(evt.target['amount'].value),
			date: evt.target['date'].value,
            userId: userId,
            note: evt.target['note'].value
		};

		let token = getTokenFromLocalStorage();

		const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/expense-input', {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify(expenseData)

            
		}).catch((error) => {
			console.error('Error:', error);
		});

		if (resp && resp.status == 200) {
			location.reload()
			loading=false;
		} else {
			console.log('Failed to upload expense');
		}
	}
 

    export function calculateTotal(expenses) {
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