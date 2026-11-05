// SmartPOS V6 STAGE 2 - PART 1: CUSTOMERS 26 REAL ACTIONS
console.log("Stage 2 Part 1 Loaded - Customers");
if (!window._oldRenderModule) window._oldRenderModule = renderModule;
function custBalance(c){ return Number(c.balance || 0); }
function custTotalPurchases(name){ return pos.filter(s => (s.customer || 'Walk-in Customer') === name).reduce((a,b)=>a+b.total,0); }
function custPurchasesCount(name){ return pos.filter(s => (s.customer || 'Walk-in Customer') === name).length; }
function renderCustomers(){
  let q = (document.getElementById('custSearch')?.value || '').toLowerCase();
  let filterBal = document.getElementById('custFilterBal')?.value || 'all';
  let list = customers.map((c,i)=>({...c,_i:i}));
  if(q) list = list.filter(c => (c.name+' '+c.phone).toLowerCase().includes(q));
  if(filterBal==='owing') list = list.filter(c => custBalance(c) > 0);
  if(filterBal==='paid') list = list.filter(c => custBalance(c) <= 0);
  let totalBal = customers.reduce((a,c)=>a+custBalance(c),0);
  let top = [...customers].sort((a,b)=>custTotalPurchases(b.name)-custTotalPurchases(a.name))[0];
  return `<div class="space-y-3">
  <div class="flex justify-between flex-wrap gap-2 items-center"><h1 class="text-[16px] font-black">👥 8. Customers - 26 REAL BUTTONS</h1>
  <div class="flex gap-1.5"><button onclick="printCustomers()" class="bg-slate-700 btn text-[10px]">🖨️ Print</button><button onclick="exportCustomersCSV()" class="bg-blue-600 btn text-[10px]">📄 Export CSV</button></div></div>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
    <div class="card"><div class="label">Total Customers</div><div class="font-black text-[16px]">${customers.length}</div><button onclick="showAllCustomers()" class="mt-1 bg-blue-600 btn text-[9px] w-full">View All</button></div>
    <div class="card"><div class="label">Total Owed To You</div><div class="font-black text-[16px] text-amber-400">$${totalBal.toFixed(2)}</div><button onclick="showOwingCustomers()" class="mt-1 bg-amber-600 btn text-[9px] w-full">View Owing</button></div>
    <div class="card"><div class="label">Top Customer</div><div class="font-black text-[12px]">${top?top.name:'-'} </div><div class="text-[10px] text-slate-400">$${top?custTotalPurchases(top.name).toFixed(2):'0.00'} bought</div><button onclick="showTopCustomers()" class="mt-1 bg-emerald-600 btn text-[9px] w-full">Top 5</button></div>
    <div class="card"><div class="label">Paid Up</div><div class="font-black text-[16px]">${customers.filter(c=>custBalance(c)<=0).length}</div><button onclick="showPaidCustomers()" class="mt-1 bg-slate-700 btn text-[9px] w-full">View Paid</button></div>
  </div>
  <div class="card"><h3 class="font-bold text-[12px] text-blue-400">Search & Filter</h3>
  <div class="flex gap-1 mt-2 flex-wrap"><input id="custSearch" oninput="renderModule('customers')" class="input" style="max-width:220px" placeholder="🔍 Search name / phone...">
  <select id="custFilterBal" onchange="renderModule('customers')" class="input" style="max-width:150px"><option value="all">All Customers</option><option value="owing">Owing Only</option><option value="paid">Paid Up Only</option></select>
  <button onclick="sortCustomers('name')" class="bg-slate-700 btn text-[10px]">Sort A-Z</button>
  <button onclick="sortCustomers('balance')" class="bg-slate-700 btn text-[10px]">Sort By Balance</button>
  <button onclick="renderModule('customers')" class="bg-blue-600 btn text-[10px]">Refresh</button></div>
  <button onclick="toggleCustomerForm()" class="w-full mt-3 bg-emerald-600 btn">➕ Add New Customer</button>
  <div id="custFormWrap"></div></div>
  <div class="card"><div class="overflow-x-auto"><table class="w-full"><tr><th class="th">Name</th><th class="th">Phone</th><th class="th">Balance</th><th class="th">Purchases</th><th class="th">Actions</th></tr>
  ${list.map(c=>`<tr class="row"><td class="td font-bold">${c.name}</td><td class="td">${c.phone||''}</td><td class="td ${custBalance(c)>0?'text-amber-400 font-bold':'text-emerald-400'}">$${custBalance(c).toFixed(2)}</td><td class="td">${custPurchasesCount(c.name)} x - $${custTotalPurchases(c.name).toFixed(2)}</td>
  <td class="td"><div class="flex gap-1 flex-wrap">
  <button onclick="viewCustomer(${c._i})" class="bg-blue-600 btn text-[9px]">View</button>
  <button onclick="editCustomer(${c._i})" class="bg-amber-600 btn text-[9px]">Edit</button>
  <button onclick="customerPayment(${c._i})" class="bg-emerald-600 btn text-[9px]">Pay</button>
  <button onclick="customerCredit(${c._i})" class="bg-purple-600 btn text-[9px]">+Credit</button>
  <button onclick="callCustomer(${c._i})" class="bg-slate-700 btn text-[9px]">📞</button>
  <button onclick="whatsappCustomer(${c._i})" class="bg-green-600 btn text-[9px]">WhatsApp</button>
  <button onclick="deleteCustomer(${c._i})" class="bg-red-600 btn text-[9px]">Delete</button>
  </div></td></tr>`).join('') || '<tr><td colspan=5 class="td text-center">No customers found</td></tr>'}
  </table></div></div>
  <div id="custDetail" class="card hidden"></div></div>`;
}
let editingCust = -1;
function toggleCustomerForm(){ const w=document.getElementById('custFormWrap'); if(w.innerHTML){w.innerHTML='';return;} editingCust=-1;
  w.innerHTML=`<div class="mt-3 p-3 bg-[#020617] rounded-xl border border-slate-800"><label class="label">Full Name</label><input id="c_name" class="input" placeholder="e.g. Tinashe Moyo"><label class="label mt-2">Phone</label><input id="c_phone" class="input" placeholder="077..."><label class="label mt-2">Opening Balance $</label><input id="c_bal" type="number" class="input" value="0"><button onclick="saveCustomer()" class="w-full mt-3 bg-emerald-600 btn">Save Customer</button></div>`; }
function saveCustomer(){ const name=document.getElementById('c_name').value.trim(); const phone=document.getElementById('c_phone').value.trim(); const bal=parseFloat(document.getElementById('c_bal').value||0);
  if(!name){alert('Enter name');return;}
  if(editingCust>=0){ customers[editingCust]={name,phone,balance:bal}; } else { customers.push({name,phone,balance:bal}); }
  saveAll(); logAudit('Save Customer '+name); renderModule('customers'); }
function editCustomer(i){ editingCust=i; const c=customers[i]; const w=document.getElementById('custFormWrap');
  w.innerHTML=`<div class="mt-3 p-3 bg-[#020617] rounded-xl border border-slate-800"><label class="label">Edit Name</label><input id="c_name" class="input" value="${c.name}"><label class="label mt-2">Phone</label><input id="c_phone" class="input" value="${c.phone||''}"><label class="label mt-2">Balance $</label><input id="c_bal" type="number" class="input" value="${custBalance(c)}"><button onclick="saveCustomer()" class="w-full mt-3 bg-amber-600 btn">Update Customer</button></div>`; w.scrollIntoView({behavior:'smooth'}); }
function deleteCustomer(i){ if(!confirm('Delete '+customers[i].name+'?'))return; logAudit('Delete Customer '+customers[i].name); customers.splice(i,1); saveAll(); renderModule('customers'); }
function viewCustomer(i){ const c=customers[i]; const el=document.getElementById('custDetail'); el.classList.remove('hidden');
  let buys = pos.filter(s=>(s.customer||'Walk-in Customer')===c.name);
  el.innerHTML=`<h3 class="font-bold">${c.name} - Details</h3><div class="text-[12px] mt-2 space-y-1"><div>Phone: ${c.phone}</div><div>Balance: <b class="text-amber-400">$${custBalance(c).toFixed(2)}</b></div><div>Total Bought: $${custTotalPurchases(c.name).toFixed(2)} (${buys.length} receipts)</div></div>
  <div class="flex gap-1 mt-3 flex-wrap"><button onclick="customerPayment(${i})" class="bg-emerald-600 btn text-[10px]">Record Payment</button><button onclick="customerCredit(${i})" class="bg-purple-600 btn text-[10px]">Add Credit</button><button onclick="clearCustomerBalance(${i})" class="bg-slate-700 btn text-[10px]">Clear Balance</button><button onclick="document.getElementById('custDetail').classList.add('hidden')" class="bg-slate-700 btn text-[10px]">Close</button></div>
  <table class="w-full mt-3"><tr><th class="th">Receipt</th><th class="th">Date</th><th class="th">Total</th></tr>${buys.map(s=>`<tr><td class="td font-mono">${s.id}</td><td class="td">${new Date(s.date).toLocaleDateString()}</td><td class="td">$${s.total.toFixed(2)}</td></tr>`).join('')||'<tr><td colspan=3 class="td text-center">No purchases yet</td></tr>'}</table>`; el.scrollIntoView({behavior:'smooth'}); }
function customerPayment(i){ let amt=parseFloat(prompt('Payment amount $ for '+customers[i].name, '')); if(!amt||amt<=0)return; customers[i].balance=Math.max(0, custBalance(customers[i])-amt); saveAll(); logAudit('Customer Payment '+customers[i].name+' $'+amt); renderModule('customers'); alert('Payment recorded. New balance $'+custBalance(customers[i]).toFixed(2)); }
function customerCredit(i){ let amt=parseFloat(prompt('Add credit $ for '+customers[i].name, '')); if(!amt||amt<=0)return; customers[i].balance=custBalance(customers[i])+amt; saveAll(); logAudit('Customer Credit '+customers[i].name+' $'+amt); renderModule('customers'); }
function clearCustomerBalance(i){ if(!confirm('Clear balance for '+customers[i].name+'?'))return; customers[i].balance=0; saveAll(); renderModule('customers'); }
function callCustomer(i){ window.location.href='tel:'+customers[i].phone; }
function whatsappCustomer(i){ window.open('https://wa.me/'+(customers[i].phone||'').replace(/[^0-9]/g,''),'_blank'); }
function showAllCustomers(){ document.getElementById('custFilterBal').value='all'; renderModule('customers'); }
function showOwingCustomers(){ document.getElementById('custFilterBal').value='owing'; renderModule('customers'); }
function showPaidCustomers(){ document.getElementById('custFilterBal').value='paid'; renderModule('customers'); }
function showTopCustomers(){ let top=[...customers].sort((a,b)=>custTotalPurchases(b.name)-custTotalPurchases(a.name)).slice(0,5); const el=document.getElementById('custDetail'); el.classList.remove('hidden'); el.innerHTML=`<h3 class="font-bold">Top 5 Customers</h3><table class="w-full mt-2"><tr><th class="th">Name</th><th class="th">Bought</th><th class="th">Balance</th></tr>${top.map(c=>`<tr><td class="td">${c.name}</td><td class="td">$${custTotalPurchases(c.name).toFixed(2)}</td><td class="td">$${custBalance(c).toFixed(2)}</td></tr>`).join('')}</table><button onclick="document.getElementById('custDetail').classList.add('hidden')" class="mt-2 bg-slate-700 btn text-[10px]">Close</button>`; }
function sortCustomers(type){ if(type==='name') customers.sort((a,b)=>a.name.localeCompare(b.name)); else customers.sort((a,b)=>custBalance(b)-custBalance(a)); saveAll(); renderModule('customers'); }
function exportCustomersCSV(){ let csv='Name,Phone,Balance,Total Bought\n'+customers.map(c=>`"${c.name}","${c.phone}",${custBalance(c)},${custTotalPurchases(c.name)}`).join('\n'); let a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='customers.csv'; a.click(); }
function printCustomers(){ window.print(); }
function renderModule(id){
  currentModule=id; logAudit('Open '+id);
  if(id==='customers'){ renderMenu(); document.getElementById('contentArea').innerHTML=renderCustomers(); if(window.innerWidth<1024) document.getElementById('sidebar').classList.add('hidden'); return; }
  if(window._oldRenderModule){ let tmp = window._oldRenderModule; window._oldRenderModule = null; tmp(id); window._oldRenderModule = tmp; return; }
}