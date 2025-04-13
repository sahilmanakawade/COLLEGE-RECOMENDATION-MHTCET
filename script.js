let filtered = collegeData;
 
   // City filter
   if (!city.includes('All')) {
     filtered = filtered.filter(c => city.includes(c.City?.toLowerCase()));
   }
 
   // Branch filter
   if (!branch.includes('All')) {
     filtered = filtered.filter(c =>
       (c.Branch && branch.some(b => c.Branch.toLowerCase().includes(b))) ||
       (c["Branch - dd"] && branch.some(b => c["Branch - dd"].toLowerCase().includes(b)))
     );
   }
 
   // Status filter
   if (!status.includes('All')) {
     filtered = filtered.filter(c => status.includes(c.Status?.toLowerCase()));
   }
 
   // Category filter
   if (!category.includes('All')) {
     filtered = filtered.filter(c => category.includes(c.Category?.toLowerCase()));
   }
 
   filtered = filtered.filter(c => parseFloat(c.Percentage) <= (percentile + 2));
   // ✅ Percentile filter: show results from (input - 10) to 100
   filtered = filtered.filter(c => {
     const perc = parseFloat(c.Percentage);
     return perc >= (percentile - 10) && perc <= 100;
   });
 
   // Sort: highest percentile first, then by rank
   filtered = filtered.sort((a, b) => {
     const percA = parseFloat(a.Percentage);
     const percB = parseFloat(b.Percentage);
 @@ -91,11 +100,13 @@ document.getElementById('form').addEventListener('submit', function(e) {
     return percB - percA || rankA - rankB;
   });
 
   // No matching colleges
   if (filtered.length === 0) {
     alert("⚠️ No matching colleges found.");
     return;
   }
 
   // Prepare data for export
   const wsData = filtered.map(row => ({
     College: row.College,
     City: row.City,
