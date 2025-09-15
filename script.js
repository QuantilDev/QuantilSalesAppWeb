let customers = [];
let contacts = [];
let previousYearData = []; // Store previous year data

// Load customers CSV data
function loadCustomersData() {
    Papa.parse("customer.csv", {
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

// Load previous year's (2023) CSV data
function loadPreviousYearData() {
    Papa.parse("2023_spend.csv", {
        download: true,
        header: true,
        complete: function(results) {
            previousYearData = results.data;
            console.log("Loaded previous year (2023) data: ", previousYearData);
        },
        error: function(error) {
            console.error("Error loading previous year (2023) CSV: ", error);
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
    const selectedCustomer = document.getElementById("customerSelect").value;
    const selectedLocation = document.getElementById("locationSelect").value;

    const filtered2024Data = customers.filter(
        customer => customer.Customer_Name === selectedCustomer && customer.Location === selectedLocation
    );

    const filtered2023Data = previousYearData.filter(
        data => data.Customer_Name === selectedCustomer && data.Location === selectedLocation
    );

    let tableBodyHTML = "";
    let total2024 = 0;
    let total2023 = 0;

    filtered2024Data.forEach(currentYearEntry => {
        const invoiceGroup = currentYearEntry.Invoice_Group;
        
        // Skip rows with "Point of Sale"
        if (invoiceGroup === "Point of Sale") {
            return; // Skip this row
        }

        const currentYearTotal = parseFloat(currentYearEntry.Total || 0);
        const currentYearVolume = parseInt(currentYearEntry.Volume || 0);
    
        const previousYearEntry = filtered2023Data.find(data => data.Invoice_Group === invoiceGroup);
        const previousYearTotal = previousYearEntry ? parseFloat(previousYearEntry.Total || 0) : 0;
        const previousYearVolume = previousYearEntry ? parseInt(previousYearEntry.Volume || 0) : 0;
    
        const totalDifference = currentYearTotal - previousYearTotal;
        const volumeDifference = currentYearVolume - previousYearVolume;
    
        // Apply classes based on positive or negative values, but not for zero
        const totalClass = totalDifference === 0 ? "" : (totalDifference >= 0 ? "positive" : "negative");
        const volumeClass = volumeDifference === 0 ? "" : (volumeDifference >= 0 ? "positive" : "negative");

        // Add class for invoice group text if volume is above 15, but exclude specific products
        const excludedProducts = [
            "Strip Vegetables Tray of 6",
            "8.5cm Pot Herb Tray of 18",
            "8.5cm Pot vegetables Tray of 18",
            "8.5cm Premium Pot Veg Tray of 18",
            "1L Pot Herb Tray of 8",
        ];

        const invoiceGroupClass = excludedProducts.includes(invoiceGroup) || currentYearVolume <= 15 ? "" : "high-volume";

        // Add class for 2024 volume if it's above 15, but exclude specific products
        const volumeClass2024 = excludedProducts.includes(invoiceGroup) || currentYearVolume <= 15 ? "" : "high-volume";

        // Add the row to the table HTML
        tableBodyHTML += `
            <tr>
                <td class="${invoiceGroupClass}">${invoiceGroup}</td>
                <td>£${currentYearTotal.toFixed(2)}</td>
                <td class="${volumeClass2024}">${currentYearVolume}</td>
                <td>£${previousYearTotal.toFixed(2)}</td>
                <td>${previousYearVolume}</td>
                <td class="${totalClass}">£${totalDifference.toFixed(2)}</td>
                <td class="${volumeClass}">${volumeDifference}</td>
            </tr>
        `;
        
        // Add totals to the total variables
        total2024 += currentYearTotal;
        total2023 += previousYearTotal;
    });

    // Calculate total difference
    const totalDifference = total2024 - total2023;
    const totalClass = totalDifference === 0 ? "" : (totalDifference >= 0 ? "positive" : "negative");

    // Create the totals section HTML
    const totalsHTML = `
        <div class="totals-section">
            <strong>Total Spend 2025: </strong>£${total2024.toFixed(2)} <br>
            <strong>Total Spend 2024: </strong>£${total2023.toFixed(2)} <br>
            <strong>Difference: </strong><span class="${totalClass}">£${totalDifference.toFixed(2)}</span>
        </div>
    `;

    // Insert the totals above the table
    document.getElementById("totalsSection").innerHTML = totalsHTML;

    // Insert the table body HTML
    document.getElementById("customerTableBody").innerHTML = tableBodyHTML;
}




// Helper function to get total from previous year's data
function getPreviousYearTotal(customerName, location) {
    const previousYearCustomer = previousYearData.find(data => 
        data["Customer_Name"] === customerName && data["Location"] === location
    );

    return previousYearCustomer ? parseFloat(previousYearCustomer["Total"]) : 0;
}

// Helper function to format numbers with commas
function formatNumberWithCommas(num) {
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

// Function to detect if the user is on a mobile device
function isMobileDevice() {
    return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

if (selectedContact) {
    // Check if the user is on a mobile device
    const isMobile = isMobileDevice();
    
    // Format telephone numbers as clickable links if on mobile
    const telephone = isMobile ? `<a href="tel:${selectedContact["Telephone"]}">${selectedContact["Telephone"]}</a>` : selectedContact["Telephone"];
    const mobileNumber = isMobile ? `<a href="tel:${selectedContact["Mobile Number"]}">${selectedContact["Mobile Number"]}</a>` : selectedContact["Mobile Number"];
    const contactPhoneNumber = isMobile ? `<a href="tel:${selectedContact["Contact Phone Number"]}">${selectedContact["Contact Phone Number"]}</a>` : selectedContact["Contact Phone Number"];

    customerDetailsContent.innerHTML = `
        <h3>Contact Details</h3>
        <p><strong>Contact Name:</strong> ${selectedContact["Contact Name"]}</p>
        <p><strong>Address Line 1:</strong> ${selectedContact["Address Line 1"]}</p>
        <p><strong>Address Line 2:</strong> ${selectedContact["Address Line 2"] || ''}</p>
        <p><strong>Town:</strong> ${selectedContact["Address Town"]}</p>
        <p><strong>County:</strong> ${selectedContact["Address County"]}</p>
        <p><strong>Postcode:</strong> ${selectedContact["Address Postcode"]}</p>
        <p><strong>Telephone:</strong> ${telephone}</p>
        <p><strong>Mobile Number:</strong> ${mobileNumber}</p>
        <p><strong>Contact Job Title:</strong> ${selectedContact["Contact Job Title"]}</p>
        <p><strong>Contact Phone Number:</strong> ${contactPhoneNumber}</p>
        <p><strong>Contact Email Address:</strong> ${selectedContact["Contact Email Address"]}</p>
        <p><strong>Direction:</strong> <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedContact["Address Postcode"])}" target="_blank">
Click Here</a></p>
    `;
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
    document.getElementById("totalsSection").innerHTML = '';  // This should clear the figures
    document.getElementById("customerDetailsContent").innerHTML = '';
    
    // Re-populate the customer dropdown after clearing
    populateCustomerSelect();
}


// Helper to check if the user is on a mobile device
function isMobileDevice() {
    return window.innerWidth <= 768;
}

document.addEventListener("DOMContentLoaded", function() {
    loadCustomersData();
    loadContactsData();
    loadPreviousYearData();

    // Event listener for customer select
    document.getElementById("customerSelect").addEventListener("change", selectCustomer);
    document.getElementById("locationSelect").addEventListener("change", showDataForLocation);
    document.getElementById("showDetailsBtn").addEventListener("click", showCustomerDetails);
});


