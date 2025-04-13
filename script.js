let collegeData = [];

window.onload = async () => {
  try {
    const response = await fetch('data.csv'); // Fetch the CSV file
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV file. Status: ${response.status}`);
    }

    const data = await response.text(); // Read as text

    console.log('CSV File Data:', data);  // Log the data to ensure it's loaded

    // Parse CSV using the XLSX library
    const workbook = XLSX.read(data, { type: 'string' });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet name
    collegeData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    console.log('Parsed college data:', collegeData);  // Log the parsed data

    // Populate dropdowns with unique values from the CSV
    populateDropdown('city', getUnique(collegeData.map(c => c.city)));
    populateDropdown('branch', getUnique(collegeData.map(c => c.branch)));
    populateDropdown('status', getUnique(collegeData.map(c => c.status)));
    populateDropdown('category', getUnique(collegeData.map(c => c.category)));
  } catch (error) {
    alert("⚠️ Failed to load data.csv. Make sure you're running a local server.");
    console.error(error);
  }
};

// Function to get unique values from an array
function getUnique(arr) {
  return ['All', ...[...new Set(arr.map(v => v?.toLowerCase().trim()))].sort()];
}

// Function to populate dropdowns
function populateDropdown(id, options) {
  const select = document.getElementById(id);
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
    select.appendChild(option);
  });
}

// Handle form submission
document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim().replace(/\s+/g, '_');
  const percentile = parseFloat(document.getElementById('percentile').value);
  const city = document.getElementById('city').value;
  const branch = document.getElementById('branch').value;
  const status = document.getElementById('status').value;
  const category = document.getElementById('category').value;

  let filtered = collegeData;

  // Apply filters
  if (city !== 'All') {
    filtered = filtered.filter(c => c.city?.toLowerCase() === city.toLowerCase());
  }
  if (branch !== 'All') {
    filtered = filtered.filter(c =>
      (c.branch && c.branch.toLowerCase().includes(branch.toLowerCase())) ||
      (c.branch_dd && c.branch_dd.toLowerCase().includes(branch.toLowerCase()))
    );
  }
  if (status !== 'All') {
    filtered = filtered.filter(c => c.status?.toLowerCase() === status.toLowerCase());
  }
  if (category !== 'All') {
    filtered = filtered.filter(c => c.category?.toLowerCase() === category.toLowerCase());
  }

  filtered = filtered.filter(c => parseFloat(c.percentage) <= (percentile + 2));

  // Sort filtered colleges
  filtered = filtered.sort((a, b) => {
    const percA = parseFloat(a.percentage);
    const percB = parseFloat(b.percentage);
    const rankA = parseInt(a.rank);
    const rankB = parseInt(b.rank);
    return percB - percA || rankA - rankB;
  });

  if (filtered.length === 0) {
    alert("⚠️ No matching colleges found. Try broader filters.");
    return;
  }

  // Prepare data for Excel export
  const wsData = filtered.map(row => {
    return {
      College: row.college,
      City: row.city,
      Branch: row.branch,
      Category: row.category,
      Percentage: row.percentage,
      Rank: row.rank,
      Status: row.status
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(wsData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Recommendations");

  // Export to Excel
  XLSX.writeFile(workbook, `${name}_college_recommendations.xlsx`);
});
