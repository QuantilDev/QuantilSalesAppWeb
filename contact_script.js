let contact = []; // Declare the contacts variable

// Function to load CSV data
function loadCSVData() {
    Papa.parse("contacts.csv", {
        download: true,
        header: true,
        complete: function(results) {
            contacts = results.data; // Assign parsed data to the contacts variable
            console.log("Loaded contacts data: ", contacts); // Log loaded data
            populateCustomerSelect(); // Populate customer dropdown after loading contacts
        },
        error: function(error) {
            console.error("Error loading CSV: ", error);
        }
    });
}

// Populate the customer dropdown with unique customer names
function populateCustomerSelect() {
    const customerSelect = document.getElementById("customerSelect");
    const uniqueCustomers = [...new Set(contacts.map(contact => contact["Customer Name"]))];
    
    uniqueCustomers.forEach(customer => {
        const option = document.createElement("option");
        option.value = customer; // Store customer name as value
        option.textContent = customer; // Display customer name
        customerSelect.appendChild(option);
    });
}

// Filter customers based on search input
function filterCustomers() {
    const searchInput = document.getElementById("customerSearch").value.trim().toLowerCase();
    const customerSelect = document.getElementById("customerSelect");
    customerSelect.innerHTML = '<option value="">Select a customer</option>'; // Clear previous options

    // Filter contacts based on customer search
    const filteredContacts = contacts.filter(contact => 
        contact["Customer Name"] && contact["Customer Name"].toLowerCase().includes(searchInput)
    );

    // Get unique filtered customers
    const uniqueFilteredCustomers = [...new Set(filteredContacts.map(contact => contact["Customer Name"]))];

    // Populate the customer dropdown with filtered contacts
    uniqueFilteredCustomers.forEach(customer => {
        const option = document.createElement("option");
        option.value = customer; // Using Customer Name as value
        option.textContent = customer; // Display Customer Name
        customerSelect.appendChild(option);
    });

    // Clear address dropdown whenever the customer search changes
    document.getElementById("addressSelect").innerHTML = '<option value="">Select an address</option>';
}

// Populate address dropdown based on selected customer
function selectCustomer() {
    const selectedCustomerName = document.getElementById("customerSelect").value;
    const addressSelect = document.getElementById("addressSelect");
    addressSelect.innerHTML = '<option value="">Select an address</option>'; // Clear previous options

    if (selectedCustomerName) {
        // Get unique addresses for the selected customer
        const customerAddresses = contacts
            .filter(contact => contact["Customer Name"] === selectedCustomerName)
            .map(contact => contact["Address Name"]);

        const uniqueAddresses = [...new Set(customerAddresses)]; // Get unique addresses

        uniqueAddresses.forEach(address => {
            const option = document.createElement("option");
            option.value = address; // Using Address Name as value
            option.textContent = address; // Display Address Name
            addressSelect.appendChild(option);
        });
    }

    // Clear contact info when changing customer
    document.getElementById("contactInfo").innerHTML = "";
}

// Function to display contact details as regular text
function displayContactDetails(contact) {
    const contactInfoDiv = document.getElementById("contactInfo");
    contactInfoDiv.innerHTML = ""; // Clear previous details

    // If no contact is selected, do not display anything
    if (!contact) return;

    const contactDetails = `
        <p><strong>Customer Name:</strong> ${contact["Customer Name"]}</p>
        <p><strong>Account Number:</strong> ${contact["Customer Account Number"]}</p>
        <p><strong>Address:</strong> ${contact["Address Name"]}, ${contact["Address Line 1"]}, ${contact["Address Line 2"] || ''}, ${contact["Address Town"]}, ${contact["Address County"]}, ${contact["Address Postcode"]}</p>
        <p><strong>Telephone:</strong> ${contact["Telephone"]}</p>
        <p><strong>Mobile Number:</strong> ${contact["Mobile Number"]}</p>
        <p><strong>Contact Name:</strong> ${contact["Contact Name"]}</p>
        <p><strong>Job Title:</strong> ${contact["Contact Job Title"]}</p>
        <p><strong>Contact Phone Number:</strong> ${contact["Contact Phone Number"]}</p>
        <p><strong>Contact Mobile Number:</strong> ${contact["Contact Mobile Number"]}</p>
        <p><strong>Contact Email Address:</strong> ${contact["Contact Email Address"]}</p>
        <hr>
    `;
    contactInfoDiv.innerHTML += contactDetails; // Append contact details to the div
}

// Function to select address and display corresponding contact details
function selectAddress() {
    const selectedCustomerName = document.getElementById("customerSelect").value;
    const selectedAddress = document.getElementById("addressSelect").value;

    if (selectedCustomerName && selectedAddress) {
        // Find the selected contact and display details
        const selectedContact = contacts.find(contact =>
            contact["Customer Name"] === selectedCustomerName && contact["Address Name"] === selectedAddress
        );
        displayContactDetails(selectedContact); // Call to display contact details
    } else {
        // Clear contact info if no address is selected
        document.getElementById("contactInfo").innerHTML = "";
    }
}

// Clear search function
function clearSearch() {
    document.getElementById("customerSearch").value = "";
    document.getElementById("customerSelect").innerHTML = '<option value="">Select a customer</option>'; // Clear dropdown
    document.getElementById("addressSelect").innerHTML = '<option value="">Select an address</option>'; // Clear address dropdown
    document.getElementById("contactInfo").innerHTML = ""; // Clear contact info
    document.getElementById("updateDetails").value = ""; // Clear details
}

// New function to send update email
function sendUpdateEmail() {
    const customerName = document.getElementById("customerSelect").options[document.getElementById("customerSelect").selectedIndex].text;
    const updateDetails = document.getElementById("updateDetails").value;
    const email = 'eve.heaton@quantil.co.uk';
    const subject = encodeURIComponent(`${customerName} - Contact Update Details`);
    const body = encodeURIComponent(updateDetails);

    // Open mailto link in the user's default email client
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

// Load CSV data when the page loads
window.onload = loadCSVData;
