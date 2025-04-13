let collegeData = [];
 let choicesInstances = {};
 
 window.onload = async () => {
   try {
     const response = await fetch('data.json');
     collegeData = await response.json();
 
     populateDropdown('city', getUnique(collegeData.map(c => c.City)));
     populateDropdown('branch', getUnique(collegeData.map(c => c.Branch)));
     populateDropdown('status', getUnique(collegeData.map(c => c.Status)));
     populateDropdown('category', getUnique(collegeData.map(c => c.Category)));
     setupChoicesDropdown('city', getUnique(collegeData.map(c => c.City)));
     setupChoicesDropdown('branch', getUnique(collegeData.map(c => c.Branch)));
     setupChoicesDropdown('status', getUnique(collegeData.map(c => c.Status)));
     setupChoicesDropdown('category', getUnique(collegeData.map(c => c.Category)));
   } catch (error) {
     alert("Failed to load data.json.");
     console.error(error);
 @@ -19,20 +20,34 @@ function getUnique(arr) {
   return ['All', ...[...new Set(arr.map(v => v?.toLowerCase().trim()))].filter(Boolean).sort()];
 }
 
 function populateDropdown(id, options) {
 function setupChoicesDropdown(id, options) {
   const select = document.getElementById(id);
   select.innerHTML = "";
 
   options.forEach(opt => {
     const option = document.createElement('option');
     option.value = opt;
     option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
     select.appendChild(option);
   });
 
   if (choicesInstances[id]) {
     choicesInstances[id].destroy();
   }
 
   choicesInstances[id] = new Choices(select, {
     removeItemButton: true,
     shouldSort: false,
     placeholder: true,
     placeholderValue: `Select ${id}`,
     maxItemCount: -1,
     searchEnabled: true,
   });
 }
 
 function getSelectedValues(id) {
   const options = document.getElementById(id).selectedOptions;
   return Array.from(options).map(opt => opt.value);
   const values = choicesInstances[id].getValue(true);
   return Array.isArray(values) ? values : [values];
 }
 
 document.getElementById('form').addEventListener('submit', function(e) {
 @@ -97,5 +112,3 @@ document.getElementById('form').addEventListener('submit', function(e) {
 
   XLSX.writeFile(workbook, `${name}_college_recommendations.xlsx`);
 });
 
