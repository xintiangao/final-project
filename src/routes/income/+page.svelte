<script>
    // import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';
    import { goto } from '$app/navigation';
	// import { getUserId } from '../../../utils/auth';
    let formErrors = {};

    function postInputExpenses() {
        goto('/');
    }

    async function InputExpenses(evt) {
        evt.preventDefault();

        // if (evt.target['minAnnualCompensation'].value < 1000) {
		// 	formErrors['minAnnualCompensation'] = { message: 'Must be larger than 1000.00' };
		// }
		// if (evt.target['maxAnnualCompensation'].value < 1000) {
		// 	formErrors['maxAnnualCompensation'] = { message: 'Must be larger than 1000.00' };
		// }
		// if (evt.target['appinstruction'].value.length < 10) {
		// 	formErrors['appinstruction'] = { message: 'Must have at least 10 characters' };
		// }

        const userId = getUserId();

        const ExpenseData = {
        user: userId,
        title: evt.target['title'].value,
        minAnnualCompensation: evt.target['minAnnualCompensation'].value,
        maxAnnualCompensation: evt.target['maxAnnualCompensation'].value,
        notes: evt.target['notes'].value,
        location: evt.target['location'].value,
        description: evt.target['description'].value,
        requirements: evt.target['requirement'].value,
        applicationInstructions: evt.target['applicationInstructions'].value
       };

        // const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/api/collections/jobs/records', {
        //   method: 'POST',
        //   mode: 'cors',
        //   headers: {
        //       'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify(jobData)
        // });

        //  if (resp.status == 200) {
        //   console.log( 'hi' )
        //     postCreateJob();
        //  } else {
        //   const res = await resp.json;
        //   formErrors = res.data
        //  }
    }
</script>


<div class="text-center text-xl mt-5">Time To Input Your Income</div>

<div class="flex justify-center items-center mt-8">
    <form on:submit={InputExpenses} class="w-1/3">
        <div class="form-control w-full">
            <label class="label" for="title">
                <span class="label-text">Date</span>
            </label>
            <input type="text" name="title" placeholder="7/3/3023" class="input input-bordered w-full" />
            {#if 'title' in formErrors}
            <label class="label" for="title">
                <span class="label-text-alt text-red-500">{formErrors['title'].message}</span>
            </label>
            {/if}
        </div>

        <div class="form-control w-full">
            <label class="label" for="minAnnualCompensation">
                <span class="label-text">Monthly Income</span>
            </label>
            <input type="number" name="minAnnualCompensation" placeholder="Monthly Income" class="input input-bordered w-full" required />
            {#if 'minAnnualCompensation' in formErrors}
            <label class="label" for="minAnnualCompensation">
                <span class="label-text-alt text-red-500">{formErrors['minAnnualCompensation'].message}</span>
            </label>
            {/if}
        </div>

        <div class="form-control w-full">
            <label class="label" for="category">
                <span class="label-text">Income from other sources</span>
            </label>
            <select name="category" class="select select-bordered w-full" required>
                <option value="">Select sources</option>
                <option value="Rent">Rent</option>
                <option value="Freelance">Freelance</option>
                <option value="Gift">Gift</option>
                <option value="Others">Others</option>
                <!-- Add more options as needed -->
            </select>
            {#if 'category' in formErrors}
            <label class="label" for="category">
                <span class="label-text-alt text-red-500">{formErrors['category'].message}</span>
            </label>
            {/if}
        </div>

        <div class="form-control w-full">
            <label class="label" for="notes">
                <span class="label-text">Notes</span>
            </label>
            <textarea name="notes" placeholder="Notes about your expenses" class="textarea h-24 resize-y w-full border border-gray-300 rounded-md p-2" required></textarea>
            {#if 'notes' in formErrors}
            <label class="label" for="notes">
                <span class="label-text-alt text-red-500">{formErrors['notes'].message}</span>
            </label>
            {/if}
        </div>

        <div class="form-control w-full mt-4">
            <button class="btn btn-md">Save</button>
        </div>
    </form>
</div>