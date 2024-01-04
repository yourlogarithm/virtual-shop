async function viewTable(tableName) {
    try {
        const response = await fetch(`/view/${tableName}`);
        const data = await response.json();
        const tableDiv = document.getElementById(tableName + 'Table');
        tableDiv.innerHTML = createTableHTML(data); // Create and insert the table
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load data');
    }
}

// Function to view purchases for a given card number
async function viewPurchases() {
    const cardNo = document.getElementById('purchases_cardNo').value;
    try {
        const response = await fetch(`/purchases/${cardNo}`);
        const data = await response.json();
        document.getElementById('purchasesTable').innerHTML = createTableHTML(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load purchases');
    }
}

// Function to view products under warranty
async function viewUnderWarranty() {
    try {
        const response = await fetch('/products-under-warranty');
        const data = await response.json();
        document.getElementById('underWarrantyTable').innerHTML = createTableHTML(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load products under warranty');
    }
}

// Function to view the most sold product
async function viewMostSold() {
    try {
        const response = await fetch('/most-sold-product');
        const data = await response.json();
        document.getElementById('mostSoldTable').innerHTML = createTableHTML(data);
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load the most sold product');
    }
}

// Function to view the date with most sales
async function viewDateMostSales() {
    try {
        const response = await fetch('/date-most-sales');
        const data = await response.json();
        document.getElementById('dateMostSalesTable').innerHTML = createTableHTML([data]); // Wrapping data in an array for uniformity
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load the date with most sales');
    }
}

// Function to view the top client
async function viewTopClient() {
    try {
        const response = await fetch('/top-client');
        const data = await response.json();
        document.getElementById('topClientTable').innerHTML = createTableHTML([data]); // Wrapping data in an array for uniformity
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load the top client');
    }
}

// Generic function to create HTML table from data
function createTableHTML(data) {
    if (data.length === 0) return 'No data available';
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');

    // Create the header row
    Object.keys(data[0]).forEach(key => {
        const headerCell = document.createElement('th');
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
    });
    table.appendChild(headerRow);

    // Create the data rows
    data.forEach(row => {
        const dataRow = document.createElement('tr');
        Object.values(row).forEach(value => {
            const dataCell = document.createElement('td');
            dataCell.textContent = value;
            dataRow.appendChild(dataCell);
        });
        table.appendChild(dataRow);
    });

    return table.outerHTML; // Return the HTML string of the table
}

// Function to sell a product (e)
function sellProduct() {
    const data = {
        cardNo: document.getElementById('sell_cardNo').value,
        pid: document.getElementById('sell_pid').value,
        qty: document.getElementById('sell_qty').value,
        ts: document.getElementById('sell_ts').value
    };
    console.log(data);
    fetch('/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(response => response.text())
      .then(data => alert(data))
      .catch(error => console.error('Error:', error));
}
