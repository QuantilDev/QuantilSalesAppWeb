// Define product groups and map to numbers
const productGroupMap = {
    "8.5 Herb 8": 1, "1L Herb 8": 1,
    "Straw 9": 2, "Straw 10": 2, "Straw 11": 2, "Straw 12": 2, "Straw 13": 2,
    "Straw 14": 2, "Straw 15": 2, "Straw 16": 2, "Straw 17": 2, "Straw 18": 2,
    "Straw 19": 2, "Straw 20": 2, "Straw 21": 2, "Straw 22": 2,
    "8.5cm Straw 9": 3, "8.5cm Straw 10": 3, "8.5cm Straw 11": 3, "8.5cm Straw 12": 3,
    "8.5cm Straw 13": 3, "8.5cm Straw 14": 3, "8.5cm Straw 15": 3, "8.5cm Straw 16": 3,
    "8.5cm Straw 17": 3, "8.5cm Straw 18": 3, "8.5cm Straw 19": 3, "8.5cm Straw 20": 3,
    "8.5cm Straw 21": 3, "8.5cm Straw 22": 3,
    "SPEA 9": 4, "SPEA 10": 4, "SPEA 11": 4, "SPEA 12": 4, "SPEA 13": 4,
    "SPEA 14": 4, "SPEA 15": 4, "SPEA 16": 4, "SPEA 17": 4, "SPEA 18": 4, "SPEA 19": 4,
    "8.5cm S/Peas 10": 5, "8.5cm S/Peas 11": 5, "8.5cm S/Peas 12": 5, "8.5cm S/Peas 13": 5,
    "8.5cm S/Peas 14": 5, "8.5cm S/Peas 15": 5, "8.5cm S/Peas 16": 5, "8.5cm S/Peas 17": 5,
    "8.5cm S/Peas 18": 5, "8.5cm S/Peas 19": 5,
    "Grafted 14": 6, "Grafted 16": 6, "Grafted 18": 6,
    "Grafted Chilli 14": 7, "Grafted Chilli 16": 7, "Grafted Chilli 18": 7,
    "Dyna Chilli 15": 8, "Dyna Chilli 17": 8,
    "P/Bean 15": 9, "P/Bean 17": 9, "P/Bean 19": 9,
    "Sweet Potato 17": 10,
    "Heritage Tom 18": 11, "Heritage Tom 20": 11,
    "1L Veg 20": 12, "1L Veg 22": 12,
    "Autumn Strip": 13,
    "Wildflower Week 12": 14,
};

// Define product group values for 'Full' and 'Half' buttons
const productGroupValues = {
    1: { full: 30, half: 15 },
    2: { full: 30, half: 16 },
    3: { full: 30, half: 15 },
    4: { full: 30, half: 15 },
    5: { full: 30, half: 16 },
    6: { full: 30, half: 20 },
    7: { full: 6, half: 3 },
    8: { full: 30, half: 16 },
    9: { full: 30, half: 16 },
    10: { full: 30, half: 16 },
    11: { full: 30, half: 16 },
    12: { full: 30, half: 20 },
    13: { full: 30, half: 15 },
    14: { full: 30, half: 16 },
};



// Load and parse CSV data
const loadCSVData = async () => {
    const response = await fetch('reserves.csv');
    const data = await response.text();
    return parseCSV(data);
};

// Parse CSV function
const parseCSV = (data) => {
    const lines = data.split('\n').map(line => line.trim()).filter(line => line);
    const headers = lines[0].split(',').map(header => header.trim());
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((acc, header, index) => {
            acc[header] = values[index] ? values[index].trim() : '';
            return acc;
        }, {});
    });
};

// Filter and display data based on selected centre
const filterCentre = () => {
    const selectedCentre = document.getElementById('centreSelect').value;
    const tableBody = document.getElementById('orderTable').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear existing data

    if (!selectedCentre) return; // Exit if no centre is selected

    const filteredData = reserves.filter(reserve => reserve.CENTRE === selectedCentre);

    if (filteredData.length > 0) {
        const productHeaders = Object.keys(filteredData[0]).filter(key => key !== 'CENTRE');

        productHeaders.forEach((product) => {
            const row = document.createElement('tr');
            const groupNumber = productGroupMap[product] || 0; 

            // Determine the CSS class for the row based on group number
            let rowClass = groupNumber ? `product-group${groupNumber}` : '';
            row.classList.add(rowClass);

            // Create cells for product name, reserves, input, and buttons
            const productCell = document.createElement('td');
            productCell.textContent = product;
            row.appendChild(productCell);

            const reservesCell = document.createElement('td');
            reservesCell.textContent = filteredData[0][product] ? filteredData[0][product] : 0;
            row.appendChild(reservesCell);

            const inputCell = document.createElement('td');
            const inputField = document.createElement('input');
            inputField.type = 'number';
            inputField.placeholder = "Enter amount";
            inputField.maxLength = 2;
            inputField.style.width = '100px';
            inputField.style.margin = 'auto';
            inputField.style.display = 'block';
            inputCell.appendChild(inputField);
            row.appendChild(inputCell);

            // Get button values for the current product group
            const fullValue = productGroupValues[groupNumber]?.full || 30;  // Default to 30 if group not defined
            const halfValue = productGroupValues[groupNumber]?.half || 15;  // Default to 15 if group not defined

            const buttonCell = document.createElement('td');
            const fullButton = document.createElement('button');
            fullButton.textContent = 'Full';
            fullButton.onclick = () => inputField.value = fullValue;
            const halfButton = document.createElement('button');
            halfButton.textContent = 'Half';
            halfButton.onclick = () => inputField.value = halfValue;

            buttonCell.appendChild(fullButton);
            buttonCell.appendChild(halfButton);
            row.appendChild(buttonCell);

            tableBody.appendChild(row);
        });
    } else {
        const row = document.createElement('tr');
        const noDataCell = document.createElement('td');
        noDataCell.colSpan = 4;
        noDataCell.textContent = "No data available for the selected centre.";
        row.appendChild(noDataCell);
        tableBody.appendChild(row);
    }
};
// Helper function to create table cells
const createCell = (text, colspan = 1) => {
    const cell = document.createElement('td');
    cell.textContent = text;
    if (colspan > 1) cell.colSpan = colspan;
    return cell;
};

const createInputCell = () => {
    const inputCell = document.createElement('td');
    const inputField = document.createElement('input');
    inputField.type = 'number';
    inputField.placeholder = "Enter amount";
    inputField.style.width = '100px';
    inputField.style.margin = 'auto';
    inputCell.appendChild(inputField);
    return inputCell;
};

const createButtonCell = () => {
    const buttonCell = document.createElement('td');
    ['Full', 'Half'].forEach((text, index) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = () => buttonCell.previousSibling.querySelector('input').value = index ? 15 : 30;
        buttonCell.appendChild(button);
    });
    return buttonCell;
};

// Load and display centres and data on page load
let reserves = [];
window.onload = async () => {
    reserves = await loadCSVData();
    populateCentreDropdown();
};

// Populate dropdown for centres
const populateCentreDropdown = () => {
    const centreSelect = document.getElementById('centreSelect');
    [...new Set(reserves.map(reserve => reserve.CENTRE))].forEach(centre => {
        const option = document.createElement('option');
        option.value = centre;
        option.textContent = centre;
        centreSelect.appendChild(option);
    });
};

// Function to generate and download CSV
const sendEmail = () => {
    const selectedCentre = document.getElementById('centreSelect').value;
    const tableRows = document.querySelectorAll('#orderTable tbody tr');
    let csvContent = "Product,2025 Reserves\n";

    tableRows.forEach(row => {
        const [productCell, , inputCell] = row.children;
        const product = productCell.textContent;
        const inputAmount = inputCell.querySelector('input').value || "0";
        csvContent += `${selectedCentre},${product},${inputAmount}\n`;
    });

    // Create a Blob for CSV, download link, and open email client
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCentre}_reserves_data.csv`;
    a.click();
    
    const emailSubject = "Reserves Data";
    const emailBody = "Please find the reserves data attached.";
    window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
};
