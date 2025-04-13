let collegeData = [];

window.onload = async () => {
  try {
    const response = await fetch('data.json');
    collegeData = await response.json();

    populateDropdown('city', getUnique(collegeData.map(c => c.City)));
    populateDropdown('branch', getUnique(collegeData.map(c => c.Branch)));
    populateDropdown('status', getUnique(collegeData.map(c => c.Status)));
    populateDropdown('category', getUnique(collegeData.map(c => c.Category)));
  } catch (error) {
    alert("Failed to load data.json.");
    console.error(error);
  }
};

function getUnique(arr) {
  return ['All', ...[...new Set(arr.map(v => v?.toLowerCase().trim()))].filter(Boolean).sort()];
}

function populateDropdown(id, options) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
    select.appendChild(option);
  });
}

function getSelectedValues(id) {
  const options = document.getElementById(id).selectedOptions;
  return Array.from(options).map(opt => opt.value);
}

document.getElementById('form').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim().replace(/\s+/g, '_');
  const percentile = parseFloat(document.getElementById('percentile').value);
  const city = getSelectedValues('city');
  const branch = getSelectedValues('branch');
  const status = getSelectedValues('status');
  const category = getSelectedValues('category');

  let filtered = collegeData;

  if (!city.includes('All')) {
    filtered = filtered.filter(c => city.includes(c.City?.toLowerCase()));
  }

  if (!branch.includes('All')) {
    filtered = filtered.filter(c =>
      (c.Branch && branch.some(b => c.Branch.toLowerCase().includes(b))) ||
      (c["Branch - dd"] && branch.some(b => c["Branch - dd"].toLowerCase().includes(b)))
    );
  }

  if (!status.includes('All')) {
    filtered = filtered.filter(c => status.includes(c.Status?.toLowerCase()));
  }

  if (!category.includes('All')) {
    filtered = filtered.filter(c => category.includes(c.Category?.toLowerCase()));
  }

  filtered = filtered.filter(c => parseFloat(c.Percentage) <= (percentile + 2));

  filtered = filtered.sort((a, b) => {
    const percA = parseFloat(a.Percentage);
    const percB = parseFloat(b.Percentage);
    const rankA = parseInt(a.Rank);
    const rankB = parseInt(b.Rank);
    return percB - percA || rankA - rankB;
  });

  if (filtered.length === 0) {
    alert("⚠️ No matching colleges found.");
    return;
  }

  const wsData = filtered.map(row => ({
    College: row.College,
    City: row.City,
    Branch: row.Branch,
    Category: row.Category,
    Percentage: row.Percentage,
    Rank: row.Rank,
    Status: row.Status
  }));

  const worksheet = XLSX.utils.json_to_sheet(wsData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Recommendations");

  XLSX.writeFile(workbook, `${name}_college_recommendations.xlsx`);
});


