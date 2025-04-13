let collegeData = [];

window.onload = async () => {
  try {
    const response = await fetch('data.json');  // Fetch from local JSON file
    collegeData = await response.json();
    console.log("Loaded collegeData:", collegeData);

    // Confirm that the dropdown elements are found in the DOM
    const citySelect = document.getElementById('city');
    const branchSelect = document.getElementById('branch');
    const statusSelect = document.getElementById('status');
    const categorySelect = document.getElementById('category');

    if (!citySelect || !branchSelect || !statusSelect || !categorySelect) {
      console.error("One or more dropdown elements not found!");
      return;
    }

    // Populate dropdowns using the JSON keys (capitalized as in your data.json)
    populateDropdown('city', getUnique(collegeData.map(c => c.City)));
    populateDropdown('branch', getUnique(collegeData.map(c => c.Branch)));
    populateDropdown('status', getUnique(collegeData.map(c => c.Status)));
    populateDropdown('category', getUnique(collegeData.map(c => c.Category)));
  } catch (error) {
    alert("Failed to load data.json. Make sure you're running a local server and the JSON is correctly formatted.");
    console.error(error);
  }
};

function getUnique(arr) {
  // Normalize values to lower case for uniqueness then sort
  return ['All', ...[...new Set(arr.map(v => (v ? v.toLowerCase().trim() : "")))]
           .filter(v => v) // filter out empty strings
           .sort()];
}

function populateDropdown(id, options) {
  const select = document.getElementById(id);
  // Clear existing options in case there are any
  select.innerHTML = "";
  // Append each option to the dropdown
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    // Capitalize first letter for display
    option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
    select.appendChild(option);
  });
}

document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim().replace(/\s+/g, '_');
  const percentile = parseFloat(document.getElementById('percentile').value);
  const city = document.getElementById('city').value;
  const branch = document.getElementById('branch').value;
  const status = document.getElementById('status').value;
  const category = document.getElementById('category').value;

  let filtered = collegeData;

  if (city !== 'All') {
    filtered = filtered.filter(c => c.City?.toLowerCase() === city.toLowerCase());
  }
  if (branch !== 'All') {
    filtered = filtered.filter(c =>
      (c.Branch && c.Branch.toLowerCase().includes(branch.toLowerCase())) ||
      (c["Branch - dd"] && c["Branch - dd"].toLowerCase().includes(branch.toLowerCase()))
    );
  }
  if (status !== 'All') {
    filtered = filtered.filter(c => c.Status?.toLowerCase() === status.toLowerCase());
  }
  if (category !== 'All') {
    filtered = filtered.filter(c => c.Category?.toLowerCase() === category.toLowerCase());
  }

  // Filter based on the percentage (using the "Percentage" key)
  filtered = filtered.filter(c => parseFloat(c.Percentage) <= (percentile + 2));

  filtered = filtered.sort((a, b) => {
    const percA = parseFloat(a.Percentage);
    const percB = parseFloat(b.Percentage);
    const rankA = parseInt(a.Rank);
    const rankB = parseInt(b.Rank);
    return percB - percA || rankA - rankB;
  });

  if (filtered.length === 0) {
    alert("⚠️ No matching colleges found. Try broader filters.");
    return;
  }

  const wsData = filtered.map(row => {
    return {
      College: row.College,
      City: row.City,
      Branch: row.Branch,
      Category: row.Category,
      Percentage: row.Percentage,
      Rank: row.Rank,
      Status: row.Status
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(wsData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Recommendations");

  XLSX.writeFile(workbook, `${name}_college_recommendations.xlsx`);
});

