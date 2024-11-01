let customers = [];
let contacts = [];

// Load customers CSV data
function loadCustomersData() {
    Papa.parse("customers.csv", {
        download: true,
        header: true,
        complete: function(results) {
            customers = results.data;
            console.log("Loaded customers data: ", customers);
            populateCustomerSelect();
        },
        error: function(error) {
            console.error("Error loading customers CSV: ", error);
        }
    });
}

// Load contacts CSV data
function loadContactsData() {
    Papa.parse("contacts.csv", {
        download: true,
        header: true,
        complete: function(results) {
            contacts = results.data;
            console.log("Loaded contacts data: ", contacts);
        },
        error: function(error) {
            console.error("Error loading contacts CSV: ", error);
        }
    });
}

// Populate customer dropdown without duplicates
function populateCustomerSelect() {
    const customerSelect = document.getElementById("customerSelect");
    const uniqueCustomers = [...new Set(customers.map(customer => customer.Customer_Name))];
    customerSelect.innerHTML = '<option value="">Select a customer</option>';

    uniqueCustomers.forEach(customerName => {
        const option = document.createElement("option");
        option.value = customerName;
        option.textContent = customerName;
        customerSelect.appendChild(option);
    });
}

// Filter customers based on search input
function filterCustomers() {
    const searchInput = document.getElementById("customerSearch").value.trim().toLowerCase();
    const filteredCustomers = customers.filter(customer => 
        customer.Customer_Name && customer.Customer_Name.toLowerCase().includes(searchInput)
    );

    const customerSelect = document.getElementById("customerSelect");
    customerSelect.innerHTML = '<option value="">Select a customer</option>';
    
    const uniqueFilteredCustomers = [...new Set(filteredCustomers.map(customer => customer.Customer_Name))];

    uniqueFilteredCustomers.forEach(customerName => {
        const option = document.createElement("option");
        option.value = customerName;
        option.textContent = customerName;
        customerSelect.appendChild(option);
    });

    // Clear the account info and table when the search input changes
    document.getElementById("accountInfo").innerHTML = '';
    document.getElementById("customerTableBody").innerHTML = '';
}

// Populate location dropdown based on selected customer
function selectCustomer() {
    const selectedCustomerName = document.getElementById("customerSelect").value;
    const locationSelect = document.getElementById("locationSelect");
    locationSelect.innerHTML = '<option value="">Select a location</option>';

    const filteredLocations = customers
        .filter(customer => customer.Customer_Name === selectedCustomerName)
        .map(customer => customer.Location);

    const uniqueLocations = [...new Set(filteredLocations)];
    uniqueLocations.forEach(location => {
        const option = document.createElement("option");
        option.value = location;
        option.textContent = location;
        locationSelect.appendChild(option);
    });
}

// Show data for the selected location and calculate total spend
function showDataForLocation() {
    const selectedLocation = document.getElementById("locationSelect").value;
    const selectedCustomerName = document.getElementById("customerSelect").value;

    const filteredCustomers = customers.filter(customer => customer.Location === selectedLocation && customer.Customer_Name === selectedCustomerName);
    
    // Calculate total spend for the selected customer and location
    const combinedData = {};
    const totalSpend = filteredCustomers.reduce((sum, customer) => {
        const invoiceGroup = customer.Invoice_Group;
        
        if (!combinedData[invoiceGroup]) {
            combinedData[invoiceGroup] = { Total: 0, Volume: 0 };
        }

        combinedData[invoiceGroup].Total += parseFloat(customer.Total);
        combinedData[invoiceGroup].Volume += parseInt(customer.Volume);
        
        // Sum up total spend
        return sum + parseFloat(customer.Total);
    }, 0);

    // Display total spend for the selected customer and location
    const accountInfoDiv = document.getElementById("accountInfo");
    accountInfoDiv.innerHTML = `<h2>Total Spend for ${selectedCustomerName} at ${selectedLocation}: £${formatNumber(totalSpend.toFixed(2))}</h2>`;

    // Populate table with invoice group data
    let tableBody = "";
    const volumeThreshold = 15; // Set the threshold for highlighting

    for (const invoiceGroup in combinedData) {
        const data = combinedData[invoiceGroup];
        const highlightClass = data.Volume > volumeThreshold ? "highlight-row" : "";

        tableBody += `
            <tr class="${highlightClass}">
                <td>${invoiceGroup}</td>
                <td>£${formatNumber(data.Total.toFixed(2))}</td>
                <td>${data.Volume}</td>
            </tr>
        `;
    }

    document.getElementById("customerTableBody").innerHTML = tableBody;
}


// Helper function to format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Display only contact details in the modal based on selected customer and location
function showCustomerDetails() {
    const selectedCustomerName = document.getElementById("customerSelect").value;
    const selectedLocation = document.getElementById("locationSelect").value;
    const customerDetailsContent = document.getElementById("customerDetailsContent");

    if (!selectedCustomerName || !selectedLocation) {
        customerDetailsContent.innerHTML = "<p>Please select a customer and a location to view details.</p>";
        openModal();
        return;
    }

    // Find the relevant contact based on selected customer name and location
    const selectedContact = contacts.find(contact => 
        contact["Customer Name"] === selectedCustomerName && 
        contact["Address Name"] === selectedLocation // Updated line to match Address Name
    );

    if (selectedContact) {
        customerDetailsContent.innerHTML = `
            <h3>Contact Details</h3>
            <p><strong>Contact Name:</strong> ${selectedContact["Contact Name"]}</p>
            <p><strong>Address Line 1:</strong> ${selectedContact["Address Line 1"]}</p>
            <p><strong>Address Line 2:</strong> ${selectedContact["Address Line 2"] || ''}</p>
            <p><strong>Town:</strong> ${selectedContact["Address Town"]}</p>
            <p><strong>County:</strong> ${selectedContact["Address County"]}</p>
            <p><strong>Postcode:</strong> ${selectedContact["Address Postcode"]}</p>
            <p><strong>Telephone:</strong> ${selectedContact["Telephone"]}</p>
            <p><strong>Mobile Number:</strong> ${selectedContact["Mobile Number"]}</p>
            <p><strong>Contact Job Title:</strong> ${selectedContact["Contact Job Title"]}</p>
            <p><strong>Contact Phone Number:</strong> ${selectedContact["Contact Phone Number"]}</p>
            <p><strong>Contact Email Address:</strong> ${selectedContact["Contact Email Address"]}</p>
            <p><strong>Direction:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedContact["Address Postcode"])}" target="_blank">
    Click Here</a></p>
        `;
        openModal();
    } else {
        customerDetailsContent.innerHTML = "<p>No contact details found for this customer at the selected location.</p>";
        openModal();
    }
}

// Function to open the modal
function openModal() {
    const modal = document.getElementById("customerDetailsModal");
    modal.style.display = "block";
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById("customerDetailsModal");
    modal.style.display = "none";
}

// Clear search function
function clearSearch() {
    document.getElementById("customerSearch").value = "";
    document.getElementById("customerSelect").innerHTML = '<option value="">Select a customer</option>';
    document.getElementById("locationSelect").innerHTML = '<option value="">Select a location</option>';
    document.getElementById("customerTableBody").innerHTML = '';
    document.getElementById("accountInfo").innerHTML = '';
    document.getElementById("customerDetailsContent").innerHTML = '';
}

// Load CSV data on page load
window.onload = function() {
    loadCustomersData();
    loadContactsData();
};

