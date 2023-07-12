import { getTokenFromLocalStorage, getUserId } from "../utils/auth";
import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
export let data

let loading=false;
let formErrors = {};

export async function uploadExpenses(evt) {
	evt.preventDefault();

	const formData = new FormData(evt.target);
	const submittedData = [];

	formErrors = {
	category: '',
	amount: '',
	date:'',
	}; 

	if (!formData.get('category')) {
		formErrors.category = 'Please select a category.';
	  } else {
		formErrors.category = '';
	  }
	  if (!formData.get('amount')) {
		formErrors.amount = 'Please enter an amount.';
	  } else {
		formErrors.amount = '';
	  }
	  if (!formData.get('date')) {
		formErrors.date = 'Please select a date.';
	  } else {
		formErrors.date = '';
	  }
	loading=true;

	const expenseRows = document.querySelectorAll('#expenseRows tr');
	expenseRows.forEach((row, index) => {
	const category = formData.get(`category_${index}`);
	const amount = formData.get(`amount_${index}`);
	const date = formData.get(`date_${index}`);
	const note = formData.get(`note_${index}`);
  
	  submittedData.push({ category, amount: parseInt(amount), date, note });
	});
	let userId = parseInt(getUserId())
	let token = getTokenFromLocalStorage();

	for (const data of submittedData) {
		const category = data.category;
		const amount = data.amount;
		const date = new Date(data.date);
		const note = data.note;
	
		const expenseData = {
		  userId: userId,
		  category: category,
		  amount: amount,
		  date: date,
		  note: note
		};


	const resp = await fetch(PUBLIC_BACKEND_BASE_URL + `/expense-input`, {
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
}

export async function uploadIncome(evt) {
	evt.preventDefault();
  
	const formData = new FormData(evt.target);
	const submittedData = [];
  
	const incomeRows = document.querySelectorAll('#incomeRows tr');
	incomeRows.forEach((row, index) => {
	  const incomeData = formData.get(`income_${index}`);
	  const amountData = formData.get(`incomeAmount_${index}`);
	  const dateData = formData.get(`date_${index}`);
	  const noteData = formData.get(`note_${index}`);
  
	  submittedData.push({ incomeData, amountData: parseInt(amountData), dateData, noteData });
	});
  
	const userId = parseInt(getUserId());
  
	const token = getTokenFromLocalStorage();
  
	for (const data of submittedData) {
	  const income = data.incomeData;
	  const amount = data.amountData;
	  const date = new Date(data.dateData);
	  const note = data.noteData;
  
	  const incomeData = {
		user: { connect: { id: userId } },
		income: income,
		amount: amount,
		date: date,
		note: note
	  };
  
	  const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/income-input', {
		method: 'POST',
		mode: 'cors',
		headers: {
		  'Content-Type': 'application/json',
		  Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(incomeData),
	  }).catch((error) => {
		console.error('Error:', error);
	  });
  
	  if (resp && resp.status === 200) {
		console.log('Income uploaded successfully');
	  } else {
		console.log('Failed to upload income');
	  }
	}
  
	location.reload();
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

export function CalculateTotalSaving(expense, incomeData){
	let totalSaving = 0;
	let totalIncome = 0;
	let totalExpense = 0;
  
	incomeData.forEach((incomeData) => {
	  const incomeAmount = incomeData.amount;
	  totalIncome += incomeAmount;
	});
  
	expense.forEach((expense) => {
	  const expenseAmount = expense.amount;
	  totalExpense += expenseAmount;
	});
	totalSaving = totalIncome-totalExpense
	return totalSaving
  }