<script>
function sortByAmount() {
  const tableBody = document.querySelector('table tbody');
  const rows = Array.from(tableBody.querySelectorAll('tr'));

  rows.sort((a, b) => {
    const amountA = parseInt(a.children[2].textContent);
    const amountB = parseInt(b.children[2].textContent);
    return amountB - amountA;
  });

  rows.forEach((row) => tableBody.appendChild(row));
}

function sortByDate() {
    const tbody = document.querySelector('table tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
      const date1 = new Date(a.children[4].textContent);
      const date2 = new Date(b.children[4].textContent);
      return date2 - date1;
    });

    rows.forEach((row) => tbody.appendChild(row));
  }

</script>

<container class="first-letter:uppercase ">
    <div class="overflow-x-auto m-10">
        <table class="table font-mono p-10">
          <!-- head -->
          <thead class="bg-primary rounded-md table-pin-rows">
            <tr class="font-bold text-lg">
              <th>
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <label class="swap swap-rotate"><input type="checkbox" />
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <div class="swap-on tooltip tooltip-right" data-tip="Sort by date" on:click={sortByDate}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <!-- svelte-ignore a11y-click-events-have-key-events -->
                  <div class="swap-off tooltip tooltip-right" data-tip="Sort by amount" on:click={sortByAmount}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </div>
                </label>                  
              </th>
              <th>Category</th>
              <th>Amount</th>
              <th>Note</th>
              <th>Date Created</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            <!-- row 1 -->
            <tr class="hover">
              <th>1</th>
              <td>Gas</td>
              <td>80</td>
              <td>Driving is fun</td>
              <td>2023-07-04</td>
              <td>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
              </td>
            </tr>
            <!-- row 2 -->
            <tr class="hover">
              <th>2</th>
              <td>Food</td>
              <td>120</td>
              <td>Yummy</td>
              <td>2023-08-19</td>
              <td>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
              </td>
            </tr>
            <!-- row 3 -->
            <tr class="hover">
              <th>3</th>
              <td>Rent</td>
              <td>1200</td>
              <td>Crib</td>
              <td>2023-06-02</td>
              <td>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
              </td>
            </tr>
            <tr>
              <th>4</th>
              <td>Gas</td>
              <td>80</td>
              <td>I drive too much</td>
              <td>2022-12-09</td>
              <td>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon></svg>
              </td>
            </tr>
              
          </tbody>
        </table>
      </div>
</container>