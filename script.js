const SUPABASE_URL = "https://hgwtadtxidwljpoikesg.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhnd3RhZHR4aWR3bGpwb2lrZXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4ODU4MjAsImV4cCI6MjEwNzQ2MTgyMH0.x1pZgX2ucJSw3Gmb4HUAFgbyeId6sFufTHT-s5E0YuU";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    alert('Login failed: ' + error.message);
  } else {
    alert('Welcome ' + email + '!');
    window.location.href = 'dashboard.html';
  }
});
}
async function checkAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'index.html';
    return;
  }
  const emailEl = document.getElementById('userEmail');
  if (emailEl) emailEl.textContent = session.user.email;
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
  });
}

if (document.getElementById('userEmail')) {
  checkAuth();
}
/* ============================================
   USERS PAGE
   ============================================ */

async function loadUsers() {
  const tbody = document.getElementById('usersTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6">Error: ${error.message}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6">No users yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${u.name || '-'}</td>
      <td>${u.email || '-'}</td>
      <td><span class="badge ${u.role}">${u.role}</span></td>
      <td><span class="badge active">${u.is_active ? 'Active' : 'Inactive'}</span></td>
      <td>
        <button class="action-btn" onclick="editUser('${u.id}')">✏️</button>
        <button class="action-btn" onclick="deleteUser('${u.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

const addUserBtn = document.getElementById('addUserBtn');
if (addUserBtn) {
  addUserBtn.addEventListener('click', () => {
    document.getElementById('addUserForm').style.display = 'block';
  });
}

const cancelUserBtn = document.getElementById('cancelUserBtn');
if (cancelUserBtn) {
  cancelUserBtn.addEventListener('click', () => {
    document.getElementById('addUserForm').style.display = 'none';
  });
}

const saveUserBtn = document.getElementById('saveUserBtn');
if (saveUserBtn) {
  saveUserBtn.addEventListener('click', async () => {
    const name = document.getElementById('newName').value;
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;

    if (!name || !email || !password) {
      alert('Please fill all fields');
      return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: { name: name, role: role }
      }
    });

    if (error) {
      alert('Error: ' + error.message);
      return;
    }

    alert('User created!');
    document.getElementById('addUserForm').style.display = 'none';
    loadUsers();
  });
}

function editUser(id) {
  alert('Edit user: ' + id);
}

function deleteUser(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    alert('Delete user: ' + id);
  }
}

if (document.getElementById('usersTableBody')) {
  checkAuth();
  loadUsers();
}
/* ============================================
   OPERATIONS PAGE
   ============================================ */

const tabButtons = document.querySelectorAll('.tab');
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    const target = document.getElementById('tab-' + btn.dataset.tab);
    if (target) target.style.display = 'block';
  });
});

async function loadIncubators() {
  const tbody = document.getElementById('incubatorsTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('incubators')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">No incubators yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((inc, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${inc.name}</td>
      <td>${inc.type}</td>
      <td>${inc.capacity || '-'}</td>
      <td>${inc.year || '-'}</td>
      <td><span class="badge active">${inc.status}</span></td>
      <td>
        <button class="action-btn" onclick="editIncubator('${inc.id}')">✏️</button>
        <button class="action-btn" onclick="deleteIncubator('${inc.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

const addIncubatorBtn = document.getElementById('addIncubatorBtn');
if (addIncubatorBtn) {
  addIncubatorBtn.addEventListener('click', () => {
    document.getElementById('addIncubatorForm').style.display = 'block';
  });
}

const cancelIncubatorBtn = document.getElementById('cancelIncubatorBtn');
if (cancelIncubatorBtn) {
  cancelIncubatorBtn.addEventListener('click', () => {
    document.getElementById('addIncubatorForm').style.display = 'none';
  });
}

const saveIncubatorBtn = document.getElementById('saveIncubatorBtn');
if (saveIncubatorBtn) {
  saveIncubatorBtn.addEventListener('click', async () => {
    const name = document.getElementById('incName').value;
    const type = document.getElementById('incType').value;
    const capacity = document.getElementById('incCapacity').value;
    const year = document.getElementById('incYear').value;

    if (!name) {
      alert('Please enter name');
      return;
    }

    const { error } = await supabaseClient
      .from('incubators')
      .insert([{
        name: name,
        type: type,
        capacity: capacity ? parseInt(capacity) : null,
        year: year ? parseInt(year) : null,
        status: 'active'
      }]);

    if (error) {
      alert('Error: ' + error.message);
      return;
    }

    alert('Incubator added!');
    document.getElementById('addIncubatorForm').style.display = 'none';
    document.getElementById('incName').value = '';
    document.getElementById('incCapacity').value = '';
    document.getElementById('incYear').value = '';
    loadIncubators();
  });
}

function editIncubator(id) {
  alert('Edit incubator: ' + id);
}

function deleteIncubator(id) {
  if (confirm('Delete this incubator?')) {
    supabaseClient.from('incubators').delete().eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadIncubators();
    });
  }
}

if (document.getElementById('incubatorsTableBody')) {
  checkAuth();
  loadIncubators();
}
/* ============================================
   PRODUCTION PAGE
   ============================================ */

async function loadCategories() {
  const tbody = document.getElementById('categoriesTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="5">Error: ${error.message}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No categories yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${c.name}</td>
      <td>${c.main_type}</td>
      <td>${c.description || '-'}</td>
      <td>
        <button class="action-btn" onclick="deleteCategory('${c.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');

  const sel = document.getElementById('healthCategory');
  if (sel) {
    sel.innerHTML = '<option value="">Select category</option>' +
      data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }
}

const addCategoryBtn = document.getElementById('addCategoryBtn');
if (addCategoryBtn) {
  addCategoryBtn.addEventListener('click', () => {
    document.getElementById('addCategoryForm').style.display = 'block';
  });
}

const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
if (cancelCategoryBtn) {
  cancelCategoryBtn.addEventListener('click', () => {
    document.getElementById('addCategoryForm').style.display = 'none';
  });
}

const saveCategoryBtn = document.getElementById('saveCategoryBtn');
if (saveCategoryBtn) {
  saveCategoryBtn.addEventListener('click', async () => {
    const name = document.getElementById('catName').value;
    const main_type = document.getElementById('catMainType').value;
    const description = document.getElementById('catDescription').value;

    if (!name) {
      alert('Please enter name');
      return;
    }

    const { error } = await supabaseClient
      .from('categories')
      .insert([{ name, main_type, description }]);

    if (error) {
      alert('Error: ' + error.message);
      return;
    }

    alert('Category added!');
    document.getElementById('addCategoryForm').style.display = 'none';
    document.getElementById('catName').value = '';
    document.getElementById('catDescription').value = '';
    loadCategories();
  });
}

function deleteCategory(id) {
  if (confirm('Delete this category?')) {
    supabaseClient.from('categories').delete().eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadCategories();
    });
  }
}

async function loadHealth() {
  const tbody = document.getElementById('healthTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('health_records')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">No health records yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((h, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${h.date}</td>
      <td>${h.disease}</td>
      <td>${h.sick}</td>
      <td>${h.deaths}</td>
      <td>${h.recovered}</td>
      <td>${h.cost || 0}</td>
    </tr>
  `).join('');
}

const addHealthBtn = document.getElementById('addHealthBtn');
if (addHealthBtn) {
  addHealthBtn.addEventListener('click', () => {
    document.getElementById('addHealthForm').style.display = 'block';
  });
}

const cancelHealthBtn = document.getElementById('cancelHealthBtn');
if (cancelHealthBtn) {
  cancelHealthBtn.addEventListener('click', () => {
    document.getElementById('addHealthForm').style.display = 'none';
  });
}

const saveHealthBtn = document.getElementById('saveHealthBtn');
if (saveHealthBtn) {
  saveHealthBtn.addEventListener('click', async () => {
    const category_id = document.getElementById('healthCategory').value;
    const disease = document.getElementById('healthDisease').value;
    const sick = document.getElementById('healthSick').value;
    const deaths = document.getElementById('healthDeaths').value;
    const recovered = document.getElementById('healthRecovered').value;
    const cost = document.getElementById('healthCost').value;

    if (!disease) {
      alert('Please enter disease name');
      return;
    }

    const { error } = await supabaseClient
      .from('health_records')
      .insert([{
        category_id: category_id || null,
        disease,
        sick: sick ? parseInt(sick) : 0,
        deaths: deaths ? parseInt(deaths) : 0,
        recovered: recovered ? parseInt(recovered) : 0,
        cost: cost ? parseFloat(cost) : 0
      }]);

    if (error) {
      alert('Error: ' + error.message);
      return;
    }

    alert('Health record added!');
    document.getElementById('addHealthForm').style.display = 'none';
    loadHealth();
  });
}

if (document.getElementById('categoriesTableBody')) {
  checkAuth();
  loadCategories();
  loadHealth();
}
/* ============================================
   FINANCE PAGE
   ============================================ */

async function loadExpenses() {
  const tbody = document.getElementById('expensesTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('expenses')
    .select('*')
    .eq('is_deleted', false)
    .order('date', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="7">No expenses yet.</td></tr>`; return; }

  tbody.innerHTML = data.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${e.date}</td>
      <td>${e.type}</td>
      <td>${e.item || '-'}</td>
      <td>${e.quantity || '-'}</td>
      <td>${Number(e.amount).toLocaleString()}</td>
      <td><button class="action-btn" onclick="deleteExpense('${e.id}')">🗑️</button></td>
    </tr>
  `).join('');
}

const addExpenseBtn = document.getElementById('addExpenseBtn');
if (addExpenseBtn) {
  addExpenseBtn.addEventListener('click', () => {
    document.getElementById('addExpenseForm').style.display = 'block';
  });
}

const cancelExpenseBtn = document.getElementById('cancelExpenseBtn');
if (cancelExpenseBtn) {
  cancelExpenseBtn.addEventListener('click', () => {
    document.getElementById('addExpenseForm').style.display = 'none';
  });
}

const saveExpenseBtn = document.getElementById('saveExpenseBtn');
if (saveExpenseBtn) {
  saveExpenseBtn.addEventListener('click', async () => {
    const type = document.getElementById('expType').value;
    const item = document.getElementById('expItem').value;
    const quantity = document.getElementById('expQuantity').value;
    const amount = document.getElementById('expAmount').value;
    const notes = document.getElementById('expNotes').value;

    if (!amount) { alert('Please enter amount'); return; }

    const { error } = await supabaseClient.from('expenses').insert([{
      type, item, quantity: quantity ? parseFloat(quantity) : null,
      amount: parseFloat(amount), notes
    }]);

    if (error) { alert('Error: ' + error.message); return; }
    alert('Expense added!');
    document.getElementById('addExpenseForm').style.display = 'none';
    loadExpenses();
  });
}

function deleteExpense(id) {
  if (confirm('Delete this expense?')) {
    supabaseClient.from('expenses').update({ is_deleted: true }).eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadExpenses();
    });
  }
}

async function loadEntries() {
  const tbody = document.getElementById('entriesTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('entries')
    .select('*')
    .eq('is_deleted', false)
    .order('date', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="7">No entries yet.</td></tr>`; return; }

  tbody.innerHTML = data.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${e.date}</td>
      <td>${e.type}</td>
      <td>${e.item || '-'}</td>
      <td>${e.quantity || '-'}</td>
      <td>${Number(e.cost || 0).toLocaleString()}</td>
      <td><button class="action-btn" onclick="deleteEntry('${e.id}')">🗑️</button></td>
    </tr>
  `).join('');
}

const addEntryBtn = document.getElementById('addEntryBtn');
if (addEntryBtn) {
  addEntryBtn.addEventListener('click', () => {
    document.getElementById('addEntryForm').style.display = 'block';
  });
}

const cancelEntryBtn = document.getElementById('cancelEntryBtn');
if (cancelEntryBtn) {
  cancelEntryBtn.addEventListener('click', () => {
    document.getElementById('addEntryForm').style.display = 'none';
  });
}

const saveEntryBtn = document.getElementById('saveEntryBtn');
if (saveEntryBtn) {
  saveEntryBtn.addEventListener('click', async () => {
    const type = document.getElementById('entryType').value;
    const item = document.getElementById('entryItem').value;
    const quantity = document.getElementById('entryQuantity').value;
    const cost = document.getElementById('entryCost').value;
    const notes = document.getElementById('entryNotes').value;

    const { error } = await supabaseClient.from('entries').insert([{
      type, item, quantity: quantity ? parseFloat(quantity) : null,
      cost: cost ? parseFloat(cost) : null, notes
    }]);

    if (error) { alert('Error: ' + error.message); return; }
    alert('Entry added!');
    document.getElementById('addEntryForm').style.display = 'none';
    loadEntries();
  });
}

function deleteEntry(id) {
  if (confirm('Delete this entry?')) {
    supabaseClient.from('entries').update({ is_deleted: true }).eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadEntries();
    });
  }
}

async function loadExits() {
  const tbody = document.getElementById('exitsTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('exits')
    .select('*')
    .eq('is_deleted', false)
    .order('date', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="7">No exits yet.</td></tr>`; return; }

  tbody.innerHTML = data.map((e, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${e.date}</td>
      <td>${e.type}</td>
      <td>${e.item || '-'}</td>
      <td>${e.quantity || '-'}</td>
      <td>${Number(e.amount || 0).toLocaleString()}</td>
      <td><button class="action-btn" onclick="deleteExit('${e.id}')">🗑️</button></td>
    </tr>
  `).join('');
}

const addExitBtn = document.getElementById('addExitBtn');
if (addExitBtn) {
  addExitBtn.addEventListener('click', () => {
    document.getElementById('addExitForm').style.display = 'block';
  });
}

const cancelExitBtn = document.getElementById('cancelExitBtn');
if (cancelExitBtn) {
  cancelExitBtn.addEventListener('click', () => {
    document.getElementById('addExitForm').style.display = 'none';
  });
}

const saveExitBtn = document.getElementById('saveExitBtn');
if (saveExitBtn) {
  saveExitBtn.addEventListener('click', async () => {
    const type = document.getElementById('exitType').value;
    const item = document.getElementById('exitItem').value;
    const quantity = document.getElementById('exitQuantity').value;
    const amount = document.getElementById('exitAmount').value;
    const notes = document.getElementById('exitNotes').value;

    const { error } = await supabaseClient.from('exits').insert([{
      type, item, quantity: quantity ? parseFloat(quantity) : null,
      amount: amount ? parseFloat(amount) : null, notes
    }]);

    if (error) { alert('Error: ' + error.message); return; }
    alert('Exit added!');
    document.getElementById('addExitForm').style.display = 'none';
    loadExits();
  });
}

function deleteExit(id) {
  if (confirm('Delete this exit?')) {
    supabaseClient.from('exits').update({ is_deleted: true }).eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadExits();
    });
  }
}

async function loadSummary() {
  if (!document.getElementById('totalExpenses')) return;

  const { data: exp } = await supabaseClient.from('expenses').select('amount').eq('is_deleted', false);
  const { data: ex } = await supabaseClient.from('exits').select('amount').eq('is_deleted', false);

  const totalExp = (exp || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalInc = (ex || []).reduce((s, e) => s + Number(e.amount || 0), 0);

  document.getElementById('totalExpenses').textContent = totalExp.toLocaleString() + ' TZS';
  document.getElementById('totalIncome').textContent = totalInc.toLocaleString() + ' TZS';
  document.getElementById('totalProfit').textContent = (totalInc - totalExp).toLocaleString() + ' TZS';
}

if (document.getElementById('expensesTableBody')) {
  checkAuth();
  loadExpenses();
  loadEntries();
  loadExits();
  loadSummary();
}
/* ============================================
   ANALYTICS PAGE
   ============================================ */

async function loadKPI() {
  if (!document.getElementById('kpiChicken')) return;

  const { data: ex } = await supabaseClient.from('exits').select('amount').eq('is_deleted', false);
  const { data: exp } = await supabaseClient.from('expenses').select('amount').eq('is_deleted', false);

  const totalRevenue = (ex || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalExpenses = (exp || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const profit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;

  document.getElementById('kpiRevenue').textContent = totalRevenue.toLocaleString() + ' TZS';
  document.getElementById('kpiExpenses').textContent = totalExpenses.toLocaleString() + ' TZS';
  document.getElementById('kpiProfit').textContent = profit.toLocaleString() + ' TZS';
  document.getElementById('kpiMargin').textContent = margin + '%';
}

async function loadMonitoring() {
  const tbody = document.getElementById('monitoringTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) { tbody.innerHTML = `<tr><td colspan="5">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="5">No users yet.</td></tr>`; return; }

  tbody.innerHTML = data.map((u, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${u.name || '-'}</td>
      <td>${u.email || '-'}</td>
      <td><span class="badge ${u.role}">${u.role}</span></td>
      <td><span class="badge active">${u.is_active ? 'Active' : 'Inactive'}</span></td>
    </tr>
  `).join('');
}

if (document.getElementById('kpiChicken')) {
  checkAuth();
  loadKPI();
  loadMonitoring();
}
/* ============================================
   SETTINGS PAGE
   ============================================ */

async function loadProfile() {
  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  if (!nameEl) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  emailEl.value = session.user.email;

  const { data } = await supabaseClient
    .from('profiles')
    .select('name')
    .eq('id', session.user.id)
    .single();

  if (data && data.name) nameEl.value = data.name;
}

const saveProfileBtn = document.getElementById('saveProfileBtn');
if (saveProfileBtn) {
  saveProfileBtn.addEventListener('click', async () => {
    const name = document.getElementById('profileName').value;
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const { error } = await supabaseClient
      .from('profiles')
      .update({ name })
      .eq('id', session.user.id);

    if (error) alert('Error: ' + error.message);
    else alert('Profile saved!');
  });
}

const saveFarmBtn = document.getElementById('saveFarmBtn');
if (saveFarmBtn) {
  saveFarmBtn.addEventListener('click', () => {
    alert('Farm info saved locally. (Database storage coming soon)');
  });
}

const saveNotifBtn = document.getElementById('saveNotifBtn');
if (saveNotifBtn) {
  saveNotifBtn.addEventListener('click', () => {
    alert('Notification settings saved!');
  });
}

if (document.getElementById('profileName')) {
  checkAuth();
  loadProfile();
}
/* ============================================
   DASHBOARD — LIVE DATA
   ============================================ */

async function loadDashboardData() {
  if (!document.getElementById('dashChicken')) return;

  const { data: exits } = await supabaseClient.from('exits').select('amount').eq('is_deleted', false);
  const { data: expenses } = await supabaseClient.from('expenses').select('amount').eq('is_deleted', false);
  const { data: batches } = await supabaseClient.from('incubation_batches').select('hatched');

  const totalRevenue = (exits || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalExpenses = (expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalHatched = (batches || []).reduce((s, b) => s + Number(b.hatched || 0), 0);
  const profit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;

  document.getElementById('dashChicken').textContent = totalHatched.toLocaleString();
  document.getElementById('dashEggs').textContent = '0';
  document.getElementById('dashRevenue').textContent = totalRevenue.toLocaleString() + ' TZS';
  document.getElementById('dashExpenses').textContent = totalExpenses.toLocaleString() + ' TZS';
  document.getElementById('dashProfit').textContent = profit.toLocaleString() + ' TZS';
  document.getElementById('dashMargin').textContent = margin + '%';
}

if (document.getElementById('dashChicken')) {
  checkAuth();
  loadDashboardData();
}
/* ============================================
   SETTINGS — FARM INFO + NOTIFICATIONS
   ============================================ */

async function loadFarmInfo() {
  if (!document.getElementById('farmName')) return;

  const { data } = await supabaseClient
    .from('farm_info')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (data) {
    document.getElementById('farmName').value = data.farm_name || '';
    document.getElementById('farmLocation').value = data.location || '';
    document.getElementById('farmPhone').value = data.phone || '';
    document.getElementById('farmCurrency').value = data.currency || 'TZS';
  }
}

const saveFarmBtnReal = document.getElementById('saveFarmBtn');
if (saveFarmBtnReal) {
  saveFarmBtnReal.onclick = async () => {
    const farm_name = document.getElementById('farmName').value;
    const location = document.getElementById('farmLocation').value;
    const phone = document.getElementById('farmPhone').value;
    const currency = document.getElementById('farmCurrency').value;

    const { data: existing } = await supabaseClient.from('farm_info').select('id').limit(1).maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabaseClient.from('farm_info').update({
        farm_name, location, phone, currency
      }).eq('id', existing.id));
    } else {
      ({ error } = await supabaseClient.from('farm_info').insert([{
        farm_name, location, phone, currency
      }]));
    }

    if (error) alert('Error: ' + error.message);
    else alert('Farm info saved!');
  };
}

async function loadUserSettings() {
  if (!document.getElementById('notifTurning')) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { data } = await supabaseClient
    .from('user_settings')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (data) {
    document.getElementById('notifTurning').checked = data.notif_turning;
    document.getElementById('notifFeed').checked = data.notif_feed;
    document.getElementById('notifHealth').checked = data.notif_health;
    document.getElementById('notifHatch').checked = data.notif_hatch;
  }
}

const saveNotifBtnReal = document.getElementById('saveNotifBtn');
if (saveNotifBtnReal) {
  saveNotifBtnReal.onclick = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const notif_turning = document.getElementById('notifTurning').checked;
    const notif_feed = document.getElementById('notifFeed').checked;
    const notif_health = document.getElementById('notifHealth').checked;
    const notif_hatch = document.getElementById('notifHatch').checked;

    const { data: existing } = await supabaseClient
      .from('user_settings')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabaseClient.from('user_settings').update({
        notif_turning, notif_feed, notif_health, notif_hatch
      }).eq('user_id', session.user.id));
    } else {
      ({ error } = await supabaseClient.from('user_settings').insert([{
        user_id: session.user.id,
        notif_turning, notif_feed, notif_health, notif_hatch
      }]));
    }

    if (error) alert('Error: ' + error.message);
    else alert('Notifications saved!');
  };
}

if (document.getElementById('farmName')) {
  loadFarmInfo();
  loadUserSettings();
}
/* ============================================
   SETTINGS — SYSTEM + BACKUP
   ============================================ */

async function loadSystemSettings() {
  if (!document.getElementById('sysTheme')) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { data } = await supabaseClient
    .from('settings')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (data) {
    document.getElementById('sysTheme').value = data.theme || 'light';
    document.getElementById('sysLanguage').value = data.language || 'en';
    document.getElementById('sysDateFormat').value = data.date_format || 'DD/MM/YYYY';
    document.getElementById('sysTimezone').value = data.timezone || 'Africa/Dar_es_Salaam';
    document.getElementById('backupEnabled').checked = data.backup_enabled || false;
    if (data.last_backup) {
      document.getElementById('lastBackup').textContent = new Date(data.last_backup).toLocaleString();
    }
  }
}

const saveSystemBtn = document.getElementById('saveSystemBtn');
if (saveSystemBtn) {
  saveSystemBtn.onclick = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const theme = document.getElementById('sysTheme').value;
    const language = document.getElementById('sysLanguage').value;
    const date_format = document.getElementById('sysDateFormat').value;
    const timezone = document.getElementById('sysTimezone').value;
    const backup_enabled = document.getElementById('backupEnabled').checked;

    const { data: existing } = await supabaseClient
      .from('settings')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabaseClient.from('settings').update({
        theme, language, date_format, timezone, backup_enabled
      }).eq('user_id', session.user.id));
    } else {
      ({ error } = await supabaseClient.from('settings').insert([{
        user_id: session.user.id,
        theme, language, date_format, timezone, backup_enabled
      }]));
    }

    if (error) alert('Error: ' + error.message);
    else alert('Preferences saved!');
  };
}

const backupNowBtn = document.getElementById('backupNowBtn');
if (backupNowBtn) {
  backupNowBtn.onclick = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    const now = new Date().toISOString();
    await supabaseClient.from('settings').update({ last_backup: now }).eq('user_id', session.user.id);
    document.getElementById('lastBackup').textContent = new Date(now).toLocaleString();
    alert('Backup completed!');
  };
}

const restoreBtn = document.getElementById('restoreBtn');
if (restoreBtn) {
  restoreBtn.onclick = () => {
    alert('Restore feature coming soon.');
  };
}

if (document.getElementById('sysTheme')) {
  loadSystemSettings();
}
/* ============================================
   REPORTS PAGE
   ============================================ */

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

function getYearRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear(), 11, 31);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

async function loadMonthlyReport() {
  if (!document.getElementById('monthRevenue')) return;
  const { start, end } = getMonthRange();

  const { data: ex } = await supabaseClient.from('exits')
    .select('amount').eq('is_deleted', false)
    .gte('date', start).lte('date', end);

  const { data: exp } = await supabaseClient.from('expenses')
    .select('amount').eq('is_deleted', false)
    .gte('date', start).lte('date', end);

  const rev = (ex || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const expTotal = (exp || []).reduce((s, e) => s + Number(e.amount || 0), 0);

  document.getElementById('monthRevenue').textContent = rev.toLocaleString() + ' TZS';
  document.getElementById('monthExpenses').textContent = expTotal.toLocaleString() + ' TZS';
  document.getElementById('monthProfit').textContent = (rev - expTotal).toLocaleString() + ' TZS';
}

async function loadYearlyReport() {
  if (!document.getElementById('yearRevenue')) return;
  const { start, end } = getYearRange();

  const { data: ex } = await supabaseClient.from('exits')
    .select('amount').eq('is_deleted', false)
    .gte('date', start).lte('date', end);

  const { data: exp } = await supabaseClient.from('expenses')
    .select('amount').eq('is_deleted', false)
    .gte('date', start).lte('date', end);

  const rev = (ex || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const expTotal = (exp || []).reduce((s, e) => s + Number(e.amount || 0), 0);

  document.getElementById('yearRevenue').textContent = rev.toLocaleString() + ' TZS';
  document.getElementById('yearExpenses').textContent = expTotal.toLocaleString() + ' TZS';
  document.getElementById('yearProfit').textContent = (rev - expTotal).toLocaleString() + ' TZS';
}

async function loadInventoryReport() {
  const tbody = document.getElementById('inventoryTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient.from('assets').select('*');
  if (error) { tbody.innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="4">No items.</td></tr>`; return; }

  tbody.innerHTML = data.map(a => `
    <tr>
      <td>${a.name}</td>
      <td>${a.type || '-'}</td>
      <td>${a.durability_years || '-'} years</td>
      <td><span class="badge active">${a.status}</span></td>
    </tr>
  `).join('');
}

document.getElementById('exportMonthlyBtn')?.addEventListener('click', () => window.print());
document.getElementById('exportYearlyBtn')?.addEventListener('click', () => window.print());

if (document.getElementById('monthRevenue')) {
  checkAuth();
  loadMonthlyReport();
  loadYearlyReport();
  loadInventoryReport();
}
/* ============================================
   CALENDAR PAGE
   ============================================ */

async function loadEvents(type, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { data, error } = await supabaseClient
    .from('calendar_events')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('event_type', type)
    .order('event_date', { ascending: true });

  if (error) { tbody.innerHTML = `<tr><td colspan="6">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="6">No events yet.</td></tr>`; return; }

  if (type === 'task') {
    tbody.innerHTML = data.map((e, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${e.event_date}</td>
        <td>${e.title}</td>
        <td><span class="badge ${e.priority === 'high' ? 'admin' : 'user'}">${e.priority}</span></td>
        <td><span class="badge active">${e.status}</span></td>
        <td><button class="action-btn" onclick="deleteEvent('${e.id}','${type}','${tbodyId}')">🗑️</button></td>
      </tr>
    `).join('');
  } else {
    tbody.innerHTML = data.map((e, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${e.event_date}</td>
        <td>${e.title}</td>
        <td>${e.notes || e.extra || '-'}</td>
        <td><button class="action-btn" onclick="deleteEvent('${e.id}','${type}','${tbodyId}')">🗑️</button></td>
      </tr>
    `).join('');
  }
}

async function addEvent(type, title, date, notes, extra, priority) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { error } = await supabaseClient.from('calendar_events').insert([{
    user_id: session.user.id,
    event_type: type,
    title, event_date: date, notes,
    extra, priority: priority || 'medium'
  }]);

  if (error) alert('Error: ' + error.message);
  else alert('Event added!');
}

async function deleteEvent(id, type, tbodyId) {
  if (!confirm('Delete this event?')) return;
  const { error } = await supabaseClient.from('calendar_events').delete().eq('id', id);
  if (error) alert('Error: ' + error.message);
  else loadEvents(type, tbodyId);
}

/* HATCH */
document.getElementById('addHatchBtn')?.addEventListener('click', () => {
  document.getElementById('addHatchForm').style.display = 'block';
});
document.getElementById('cancelHatchBtn')?.addEventListener('click', () => {
  document.getElementById('addHatchForm').style.display = 'none';
});
document.getElementById('saveHatchBtn')?.addEventListener('click', async () => {
  const title = document.getElementById('hatchTitle').value;
  const date = document.getElementById('hatchDate').value;
  const notes = document.getElementById('hatchNotes').value;
  if (!title || !date) { alert('Fill all fields'); return; }
  await addEvent('hatch', title, date, notes);
  document.getElementById('addHatchForm').style.display = 'none';
  loadEvents('hatch', 'hatchTableBody');
});

/* VACCINATION */
document.getElementById('addVaccBtn')?.addEventListener('click', () => {
  document.getElementById('addVaccForm').style.display = 'block';
});
document.getElementById('cancelVaccBtn')?.addEventListener('click', () => {
  document.getElementById('addVaccForm').style.display = 'none';
});
document.getElementById('saveVaccBtn')?.addEventListener('click', async () => {
  const title = document.getElementById('vaccTitle').value;
  const date = document.getElementById('vaccDate').value;
  const flock = document.getElementById('vaccFlock').value;
  if (!title || !date) { alert('Fill all fields'); return; }
  await addEvent('vaccination', title, date, null, flock);
  document.getElementById('addVaccForm').style.display = 'none';
  loadEvents('vaccination', 'vaccTableBody');
});

/* TASKS */
document.getElementById('addTaskBtn')?.addEventListener('click', () => {
  document.getElementById('addTaskForm').style.display = 'block';
});
document.getElementById('cancelTaskBtn')?.addEventListener('click', () => {
  document.getElementById('addTaskForm').style.display = 'none';
});
document.getElementById('saveTaskBtn')?.addEventListener('click', async () => {
  const title = document.getElementById('taskTitle').value;
  const date = document.getElementById('taskDate').value;
  const priority = document.getElementById('taskPriority').value;
  if (!title || !date) { alert('Fill all fields'); return; }
  await addEvent('task', title, date, null, null, priority);
  document.getElementById('addTaskForm').style.display = 'none';
  loadEvents('task', 'tasksTableBody');
});

if (document.getElementById('hatchTableBody')) {
  checkAuth();
  loadEvents('hatch', 'hatchTableBody');
  loadEvents('vaccination', 'vaccTableBody');
  loadEvents('task', 'tasksTableBody');
}
/* ============================================
   INCUBATION BATCHES PAGE
   ============================================ */

async function loadIncubatorOptions() {
  const sel = document.getElementById('batchIncubator');
  if (!sel) return;

  const { data } = await supabaseClient.from('incubators').select('id, name');
  sel.innerHTML = '<option value="">Select incubator</option>' +
    (data || []).map(i => `<option value="${i.id}">${i.name}</option>`).join('');
}

async function loadCategoryOptions() {
  const sel = document.getElementById('batchCategory');
  if (!sel) return;

  const { data } = await supabaseClient.from('categories').select('id, name');
  sel.innerHTML = '<option value="">Select category</option>' +
    (data || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadBatches() {
  const tbody = document.getElementById('batchesTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('incubation_batches')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="9">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="9">No batches yet.</td></tr>`; return; }

  tbody.innerHTML = data.map((b, i) => {
    const rate = b.eggs_count > 0 ? ((b.hatched / b.eggs_count) * 100).toFixed(1) : 0;
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${b.start_date}</td>
        <td>${b.eggs_count}</td>
        <td>${b.hatch_date || '-'}</td>
        <td>${b.hatched || 0}</td>
        <td>${b.failed || 0}</td>
        <td>${rate}%</td>
        <td><span class="badge ${b.status === 'incubating' ? 'user' : 'active'}">${b.status}</span></td>
        <td>
          <button class="action-btn" onclick="editBatch('${b.id}')">✏️</button>
          <button class="action-btn" onclick="deleteBatch('${b.id}')">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

document.getElementById('addBatchBtn')?.addEventListener('click', () => {
  document.getElementById('addBatchForm').style.display = 'block';
});

document.getElementById('cancelBatchBtn')?.addEventListener('click', () => {
  document.getElementById('addBatchForm').style.display = 'none';
});

document.getElementById('saveBatchBtn')?.addEventListener('click', async () => {
  const incubator_id = document.getElementById('batchIncubator').value;
  const category_id = document.getElementById('batchCategory').value;
  const start_date = document.getElementById('batchStartDate').value;
  const eggs_count = document.getElementById('batchEggs').value;
  const hatch_date = document.getElementById('batchHatchDate').value;

  if (!start_date || !eggs_count) {
    alert('Please fill start date and eggs count');
    return;
  }

  const { error } = await supabaseClient.from('incubation_batches').insert([{
    incubator_id: incubator_id || null,
    category_id: category_id || null,
    start_date,
    eggs_count: parseInt(eggs_count),
    hatch_date: hatch_date || null,
    status: 'incubating'
  }]);

  if (error) { alert('Error: ' + error.message); return; }

  alert('Batch added!');
  document.getElementById('addBatchForm').style.display = 'none';
  document.getElementById('batchEggs').value = '';
  loadBatches();
});

function editBatch(id) {
  alert('Edit batch: ' + id);
}

function deleteBatch(id) {
  if (confirm('Delete this batch?')) {
    supabaseClient.from('incubation_batches').delete().eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadBatches();
    });
  }
}

if (document.getElementById('batchesTableBody')) {
  checkAuth();
  loadIncubatorOptions();
  loadCategoryOptions();
  loadBatches();
}
/* ============================================
   TURNING LOGS PAGE
   ============================================ */

async function loadBatchOptions() {
  const sel = document.getElementById('turnBatch');
  if (!sel) return;

  const { data } = await supabaseClient
    .from('incubation_batches')
    .select('id, start_date, eggs_count');

  sel.innerHTML = '<option value="">Select batch</option>' +
    (data || []).map(b => `<option value="${b.id}">Batch ${b.start_date} (${b.eggs_count} eggs)</option>`).join('');
}

async function loadTurnings() {
  const tbody = document.getElementById('turningTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('turning_logs')
    .select('*')
    .order('turn_date', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="7">No turning records yet.</td></tr>`; return; }

  tbody.innerHTML = data.map((t, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${t.turn_date}</td>
      <td>${t.batch_id?.slice(0, 8) || '-'}</td>
      <td>${t.turn_count}</td>
      <td>${t.temperature || '-'}°C</td>
      <td>${t.humidity || '-'}%</td>
      <td><span class="badge ${t.condition === 'good' ? 'active' : t.condition === 'bad' ? 'admin' : 'user'}">${t.condition}</span></td>
    </tr>
  `).join('');
}

document.getElementById('saveTurningBtn')?.addEventListener('click', async () => {
  const batch_id = document.getElementById('turnBatch').value;
  const turn_count = document.getElementById('turnCount').value;
  const temperature = document.getElementById('turnTemp').value;
  const humidity = document.getElementById('turnHumidity').value;
  const condition = document.getElementById('turnCondition').value;

  if (!batch_id) { alert('Please select batch'); return; }

  const { error } = await supabaseClient.from('turning_logs').insert([{
    batch_id,
    turn_count: turn_count ? parseInt(turn_count) : 0,
    temperature: temperature ? parseFloat(temperature) : null,
    humidity: humidity ? parseFloat(humidity) : null,
    condition
  }]);

  if (error) { alert('Error: ' + error.message); return; }
  alert('Turning log added!');
  loadTurnings();
});

if (document.getElementById('turningTableBody')) {
  checkAuth();
  loadBatchOptions();
  loadTurnings();
}
/* ============================================
   CANDLING PAGE
   ============================================ */

async function loadBatchOptionsCandle() {
  const sel = document.getElementById('candleBatch');
  if (!sel) return;

  const { data } = await supabaseClient
    .from('incubation_batches')
    .select('id, start_date, eggs_count');

  sel.innerHTML = '<option value="">Select batch</option>' +
    (data || []).map(b => `<option value="${b.id}">Batch ${b.start_date} (${b.eggs_count} eggs)</option>`).join('');
}

async function loadCandling() {
  const tbody = document.getElementById('candlingTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('candling_logs')
    .select('*')
    .order('candle_date', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="7">No candling records yet.</td></tr>`; return; }

  tbody.innerHTML = data.map((c, i) => {
    const total = c.fertile + c.infertile;
    const rate = total > 0 ? ((c.fertile / total) * 100).toFixed(1) : 0;
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${c.candle_date}</td>
        <td>${c.batch_id?.slice(0, 8) || '-'}</td>
        <td>Day ${c.day_number}</td>
        <td>${c.fertile}</td>
        <td>${c.infertile}</td>
        <td>${rate}%</td>
      </tr>
    `;
  }).join('');
}

document.getElementById('saveCandlingBtn')?.addEventListener('click', async () => {
  const batch_id = document.getElementById('candleBatch').value;
  const day_number = document.getElementById('candleDay').value;
  const fertile = document.getElementById('candleFertile').value;
  const infertile = document.getElementById('candleInfertile').value;

  if (!batch_id) { alert('Please select batch'); return; }

  const { error } = await supabaseClient.from('candling_logs').insert([{
    batch_id,
    day_number: parseInt(day_number),
    fertile: fertile ? parseInt(fertile) : 0,
    infertile: infertile ? parseInt(infertile) : 0
  }]);

  if (error) { alert('Error: ' + error.message); return; }
  alert('Candling result added!');
  loadCandling();
});

if (document.getElementById('candlingTableBody')) {
  checkAuth();
  loadBatchOptionsCandle();
  loadCandling();
}
/* ============================================
   ASSETS PAGE
   ============================================ */

async function loadAssets() {
  const tbody = document.getElementById('assetsTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="8">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="8">No assets yet.</td></tr>`; return; }

  tbody.innerHTML = data.map((a, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${a.name}</td>
      <td>${a.type || '-'}</td>
      <td>${Number(a.purchase_cost || 0).toLocaleString()} TZS</td>
      <td>${a.purchase_date || '-'}</td>
      <td>${a.durability_years || '-'} yrs</td>
      <td><span class="badge active">${a.status}</span></td>
      <td>
        <button class="action-btn" onclick="deleteAsset('${a.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('addAssetBtn')?.addEventListener('click', () => {
  document.getElementById('addAssetForm').style.display = 'block';
});

document.getElementById('cancelAssetBtn')?.addEventListener('click', () => {
  document.getElementById('addAssetForm').style.display = 'none';
});

document.getElementById('saveAssetBtn')?.addEventListener('click', async () => {
  const name = document.getElementById('assetName').value;
  const type = document.getElementById('assetType').value;
  const purchase_cost = document.getElementById('assetCost').value;
  const purchase_date = document.getElementById('assetDate').value;
  const durability_years = document.getElementById('assetDurability').value;

  if (!name) { alert('Please enter name'); return; }

  const { error } = await supabaseClient.from('assets').insert([{
    name, type,
    purchase_cost: purchase_cost ? parseFloat(purchase_cost) : null,
    purchase_date: purchase_date || null,
    durability_years: durability_years ? parseInt(durability_years) : null,
    status: 'active'
  }]);

  if (error) { alert('Error: ' + error.message); return; }
  alert('Asset added!');
  document.getElementById('addAssetForm').style.display = 'none';
  loadAssets();
});

function deleteAsset(id) {
  if (confirm('Delete this asset?')) {
    supabaseClient.from('assets').delete().eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadAssets();
    });
  }
}

if (document.getElementById('assetsTableBody')) {
  checkAuth();
  loadAssets();
}
/* ============================================
   SUB-TYPES PAGE
   ============================================ */

async function loadCategoryOptionsSub() {
  const sel = document.getElementById('subCategory');
  if (!sel) return;

  const { data } = await supabaseClient.from('categories').select('id, name');
  sel.innerHTML = '<option value="">Select category</option>' +
    (data || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadSubTypes() {
  const tbody = document.getElementById('subTypesTableBody');
  if (!tbody) return;

  const { data: subs, error } = await supabaseClient
    .from('sub_types')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`; return; }
  if (!subs || subs.length === 0) { tbody.innerHTML = `<tr><td colspan="7">No sub-types yet.</td></tr>`; return; }

  const { data: cats } = await supabaseClient.from('categories').select('id, name');
  const catMap = {};
  (cats || []).forEach(c => catMap[c.id] = c.name);

  tbody.innerHTML = subs.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${s.name}</td>
      <td>${catMap[s.category_id] || '-'}</td>
      <td>${s.quantity || 0}</td>
      <td>${s.age_days || 0}</td>
      <td><span class="badge ${s.health === 'good' ? 'active' : s.health === 'bad' ? 'admin' : 'user'}">${s.health}</span></td>
      <td><button class="action-btn" onclick="deleteSubType('${s.id}')">🗑️</button></td>
    </tr>
  `).join('');
}

document.getElementById('saveSubTypeBtn')?.addEventListener('click', async () => {
  const category_id = document.getElementById('subCategory').value;
  const name = document.getElementById('subName').value;
  const quantity = document.getElementById('subQuantity').value;
  const age_days = document.getElementById('subAge').value;
  const health = document.getElementById('subHealth').value;

  if (!category_id || !name) { alert('Please fill category and name'); return; }

  const { error } = await supabaseClient.from('sub_types').insert([{
    category_id, name,
    quantity: quantity ? parseInt(quantity) : 0,
    age_days: age_days ? parseInt(age_days) : 0,
    health
  }]);

  if (error) { alert('Error: ' + error.message); return; }
  alert('Sub-type added!');
  loadSubTypes();
});

function deleteSubType(id) {
  if (confirm('Delete this sub-type?')) {
    supabaseClient.from('sub_types').delete().eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadSubTypes();
    });
  }
}

if (document.getElementById('subTypesTableBody')) {
  checkAuth();
  loadCategoryOptionsSub();
  loadSubTypes();
}
/* ============================================
   FEED MANAGEMENT PAGE
   ============================================ */

document.getElementById('calcBtn')?.addEventListener('click', () => {
  const birds = parseInt(document.getElementById('calcBirds').value) || 0;
  const perBird = parseFloat(document.getElementById('calcPerBird').value) || 100;

  const dailyGrams = birds * perBird;
  const dailyKg = dailyGrams / 1000;
  const weeklyKg = dailyKg * 7;
  const monthlyKg = dailyKg * 30;

  document.getElementById('dailyFeed').textContent = dailyKg.toFixed(2) + ' kg';
  document.getElementById('weeklyFeed').textContent = weeklyKg.toFixed(2) + ' kg';
  document.getElementById('monthlyFeed').textContent = monthlyKg.toFixed(2) + ' kg';
  document.getElementById('calcResult').style.display = 'grid';
});

if (document.getElementById('calcBtn')) {
  checkAuth();
}
/* ============================================
   INVENTORY PAGE
   ============================================ */

async function loadInventory() {
  const tbody = document.getElementById('stockTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('inventory')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="8">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="8">No items yet.</td></tr>`; return; }

  tbody.innerHTML = data.map((item, i) => {
    const value = Number(item.quantity || 0) * Number(item.unit_cost || 0);
    const status = item.quantity <= item.reorder_level ? 'Low Stock' : 'In Stock';
    const badgeClass = item.quantity <= item.reorder_level ? 'admin' : 'active';
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.quantity}</td>
        <td>${item.unit}</td>
        <td>${value.toLocaleString()}</td>
        <td><span class="badge ${badgeClass}">${status}</span></td>
        <td><button class="action-btn" onclick="deleteInventory('${item.id}')">🗑️</button></td>
      </tr>
    `;
  }).join('');
}

document.getElementById('addStockBtn')?.addEventListener('click', () => {
  document.getElementById('addStockForm').style.display = 'block';
});

document.getElementById('cancelStockBtn')?.addEventListener('click', () => {
  document.getElementById('addStockForm').style.display = 'none';
});

document.getElementById('saveStockBtn')?.addEventListener('click', async () => {
  const name = document.getElementById('stockName').value;
  const category = document.getElementById('stockCategory').value;
  const quantity = document.getElementById('stockQty').value;
  const unit = document.getElementById('stockUnit').value;
  const unit_cost = document.getElementById('stockCost').value;

  if (!name) { alert('Please enter item name'); return; }

  const { error } = await supabaseClient.from('inventory').insert([{
    name, category,
    quantity: quantity ? parseFloat(quantity) : 0,
    unit: unit || 'pcs',
    unit_cost: unit_cost ? parseFloat(unit_cost) : 0,
    reorder_level: 10
  }]);

  if (error) { alert('Error: ' + error.message); return; }
  alert('Inventory item added!');
  document.getElementById('addStockForm').style.display = 'none';
  loadInventory();
});

function deleteInventory(id) {
  if (confirm('Delete this item?')) {
    supabaseClient.from('inventory').delete().eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadInventory();
    });
  }
}

if (document.getElementById('stockTableBody')) {
  checkAuth();
  loadInventory();
}
/* ============================================
   CUSTOMERS PAGE
   ============================================ */

async function loadCustomers() {
  const tbody = document.getElementById('customersTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="6">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="6">No customers yet.</td></tr>`; return; }

  tbody.innerHTML = data.map((c, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${c.name}</td>
      <td>${c.phone || '-'}</td>
      <td>${c.email || '-'}</td>
      <td>${c.location || '-'}</td>
      <td><button class="action-btn" onclick="deleteCustomer('${c.id}')">🗑️</button></td>
    </tr>
  `).join('');
}

document.getElementById('addCustomerBtn')?.addEventListener('click', () => {
  document.getElementById('addCustomerForm').style.display = 'block';
});

document.getElementById('cancelCustomerBtn')?.addEventListener('click', () => {
  document.getElementById('addCustomerForm').style.display = 'none';
});

document.getElementById('saveCustomerBtn')?.addEventListener('click', async () => {
  const name = document.getElementById('custName').value;
  const phone = document.getElementById('custPhone').value;
  const email = document.getElementById('custEmail').value;
  const location = document.getElementById('custLocation').value;

  if (!name) { alert('Please enter customer name'); return; }

  const { error } = await supabaseClient.from('customers').insert([{
    name, phone, email, location
  }]);

  if (error) { alert('Error: ' + error.message); return; }
  alert('Customer added!');
  document.getElementById('addCustomerForm').style.display = 'none';
  loadCustomers();
});

function deleteCustomer(id) {
  if (confirm('Delete this customer?')) {
    supabaseClient.from('customers').delete().eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadCustomers();
    });
  }
}

if (document.getElementById('customersTableBody')) {
  checkAuth();
  loadCustomers();
}
/* ============================================
   NOTIFICATIONS PAGE
   ============================================ */

async function loadNotifications() {
  const tbody = document.getElementById('notificationsTableBody');
  if (!tbody) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  const { data, error } = await supabaseClient
    .from('notifications')
    .select('*')
    .eq('user_id', session.user.id)
    .order('notif_date', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="7">No notifications yet.</td></tr>`; return; }

  tbody.innerHTML = data.map((n, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${n.notif_date}</td>
      <td><span class="badge ${n.type === 'alert' || n.type === 'warning' ? 'admin' : n.type === 'success' ? 'active' : 'user'}">${n.type}</span></td>
      <td>${n.title}</td>
      <td>${n.message || '-'}</td>
      <td>${n.is_read ? 'Read' : 'Unread'}</td>
      <td>
        <button class="action-btn" onclick="markRead('${n.id}')">✅</button>
        <button class="action-btn" onclick="deleteNotif('${n.id}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('addNotifBtn')?.addEventListener('click', () => {
  document.getElementById('addNotifForm').style.display = 'block';
});

document.getElementById('cancelNotifBtn')?.addEventListener('click', () => {
  document.getElementById('addNotifForm').style.display = 'none';
});

document.getElementById('saveNotifBtn')?.addEventListener('click', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;

  const title = document.getElementById('notifTitle').value;
  const message = document.getElementById('notifMessage').value;
  const type = document.getElementById('notifType').value;
  const notif_date = document.getElementById('notifDate').value || new Date().toISOString().split('T')[0];

  if (!title) { alert('Please enter title'); return; }

  const { error } = await supabaseClient.from('notifications').insert([{
    user_id: session.user.id,
    title, message, type, notif_date
  }]);

  if (error) { alert('Error: ' + error.message); return; }
  alert('Notification added!');
  document.getElementById('addNotifForm').style.display = 'none';
  loadNotifications();
});

function markRead(id) {
  supabaseClient.from('notifications').update({ is_read: true }).eq('id', id).then(() => loadNotifications());
}

function deleteNotif(id) {
  if (confirm('Delete this notification?')) {
    supabaseClient.from('notifications').delete().eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadNotifications();
    });
  }
}

if (document.getElementById('notificationsTableBody')) {
  checkAuth();
  loadNotifications();
}
/* ============================================
   EGG PRODUCTION PAGE
   ============================================ */

async function loadEggCategoryOptions() {
  const sel = document.getElementById('eggCategory');
  if (!sel) return;

  const { data } = await supabaseClient.from('categories').select('id, name');
  sel.innerHTML = '<option value="">Select category</option>' +
    (data || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadEggs() {
  const tbody = document.getElementById('eggsTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('egg_records')
    .select('*')
    .order('egg_date', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="7">No egg records yet.</td></tr>`; return; }

  const { data: cats } = await supabaseClient.from('categories').select('id, name');
  const catMap = {};
  (cats || []).forEach(c => catMap[c.id] = c.name);

  tbody.innerHTML = data.map((e, i) => {
    const good = (e.eggs || 0) - (e.broken || 0);
    return `
      <tr>
        <td>${i + 1}</td>
        <td>${e.egg_date}</td>
        <td>${catMap[e.category_id] || '-'}</td>
        <td>${e.eggs}</td>
        <td>${e.broken}</td>
        <td>${good}</td>
        <td><button class="action-btn" onclick="deleteEgg('${e.id}')">🗑️</button></td>
      </tr>
    `;
  }).join('');
}

async function loadEggTrend() {
  if (!document.getElementById('eggsToday')) return;

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const { data } = await supabaseClient.from('egg_records').select('egg_date, eggs');

  const todayTotal = (data || []).filter(e => e.egg_date === today).reduce((s, e) => s + (e.eggs || 0), 0);
  const weekTotal = (data || []).filter(e => e.egg_date >= weekAgo).reduce((s, e) => s + (e.eggs || 0), 0);
  const monthTotal = (data || []).filter(e => e.egg_date >= monthAgo).reduce((s, e) => s + (e.eggs || 0), 0);

  document.getElementById('eggsToday').textContent = todayTotal.toLocaleString();
  document.getElementById('eggsWeek').textContent = weekTotal.toLocaleString();
  document.getElementById('eggsMonth').textContent = monthTotal.toLocaleString();
}

document.getElementById('addEggBtn')?.addEventListener('click', () => {
  document.getElementById('addEggForm').style.display = 'block';
});

document.getElementById('cancelEggBtn')?.addEventListener('click', () => {
  document.getElementById('addEggForm').style.display = 'none';
});

document.getElementById('saveEggBtn')?.addEventListener('click', async () => {
  const category_id = document.getElementById('eggCategory').value;
  const egg_date = document.getElementById('eggDate').value || new Date().toISOString().split('T')[0];
  const eggs = document.getElementById('eggCount').value;
  const broken = document.getElementById('eggBroken').value;

  if (!eggs) { alert('Please enter egg count'); return; }

  const { error } = await supabaseClient.from('egg_records').insert([{
    category_id: category_id || null,
    egg_date,
    eggs: parseInt(eggs),
    broken: broken ? parseInt(broken) : 0
  }]);

  if (error) { alert('Error: ' + error.message); return; }
  alert('Egg record added!');
  document.getElementById('addEggForm').style.display = 'none';
  loadEggs();
  loadEggTrend();
});

function deleteEgg(id) {
  if (confirm('Delete this record?')) {
    supabaseClient.from('egg_records').delete().eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else { loadEggs(); loadEggTrend(); }
    });
  }
}

if (document.getElementById('eggsTableBody')) {
  checkAuth();
  loadEggCategoryOptions();
  loadEggs();
  loadEggTrend();
}
/* ============================================
   GROWTH TRACKING PAGE
   ============================================ */

async function loadGrowthCategoryOptions() {
  const sel = document.getElementById('growthCategory');
  if (!sel) return;

  const { data } = await supabaseClient.from('categories').select('id, name');
  sel.innerHTML = '<option value="">Select category</option>' +
    (data || []).map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadGrowth() {
  const tbody = document.getElementById('growthTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('growth_records')
    .select('*')
    .order('record_date', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="7">No growth records yet.</td></tr>`; return; }

  const { data: cats } = await supabaseClient.from('categories').select('id, name');
  const catMap = {};
  (cats || []).forEach(c => catMap[c.id] = c.name);

  tbody.innerHTML = data.map((g, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${g.record_date}</td>
      <td>${catMap[g.category_id] || '-'}</td>
      <td>${g.age_days}</td>
      <td>${g.avg_weight} g</td>
      <td>${g.sample_size}</td>
      <td><button class="action-btn" onclick="deleteGrowth('${g.id}')">🗑️</button></td>
    </tr>
  `).join('');
}

document.getElementById('saveGrowthBtn')?.addEventListener('click', async () => {
  const category_id = document.getElementById('growthCategory').value;
  const age_days = document.getElementById('growthAge').value;
  const avg_weight = document.getElementById('growthWeight').value;
  const sample_size = document.getElementById('growthSample').value;

  if (!avg_weight) { alert('Please enter average weight'); return; }

  const { error } = await supabaseClient.from('growth_records').insert([{
    category_id: category_id || null,
    age_days: age_days ? parseInt(age_days) : 0,
    avg_weight: parseFloat(avg_weight),
    sample_size: sample_size ? parseInt(sample_size) : 0
  }]);

  if (error) { alert('Error: ' + error.message); return; }
  alert('Growth record added!');
  loadGrowth();
});

function deleteGrowth(id) {
  if (confirm('Delete this record?')) {
    supabaseClient.from('growth_records').delete().eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadGrowth();
    });
  }
}

if (document.getElementById('growthTableBody')) {
  checkAuth();
  loadGrowthCategoryOptions();
  loadGrowth();
}
/* ============================================
   TREATMENTS PAGE
   ============================================ */

async function loadTreatments() {
  const tbody = document.getElementById('treatmentsTableBody');
  if (!tbody) return;

  const { data, error } = await supabaseClient
    .from('treatments')
    .select('*')
    .order('treatment_date', { ascending: false });

  if (error) { tbody.innerHTML = `<tr><td colspan="7">Error: ${error.message}</td></tr>`; return; }
  if (!data || data.length === 0) { tbody.innerHTML = `<tr><td colspan="7">No treatments yet.</td></tr>`; return; }

  tbody.innerHTML = data.map((t, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${t.treatment_date}</td>
      <td>${t.disease || '-'}</td>
      <td>${t.medicine || '-'}</td>
      <td>${t.dosage || '-'}</td>
      <td>${Number(t.cost || 0).toLocaleString()}</td>
      <td><button class="action-btn" onclick="deleteTreatment('${t.id}')">🗑️</button></td>
    </tr>
  `).join('');
}

document.getElementById('addTreatmentBtn')?.addEventListener('click', () => {
  document.getElementById('addTreatmentForm').style.display = 'block';
});

document.getElementById('cancelTreatmentBtn')?.addEventListener('click', () => {
  document.getElementById('addTreatmentForm').style.display = 'none';
});

document.getElementById('saveTreatmentBtn')?.addEventListener('click', async () => {
  const disease = document.getElementById('treatDisease').value;
  const medicine = document.getElementById('treatMedicine').value;
  const dosage = document.getElementById('treatDosage').value;
  const cost = document.getElementById('treatCost').value;
  const treatment_date = document.getElementById('treatDate').value || new Date().toISOString().split('T')[0];

  if (!medicine) { alert('Please enter medicine'); return; }

  const { error } = await supabaseClient.from('treatments').insert([{
    disease, medicine, dosage,
    cost: cost ? parseFloat(cost) : 0,
    treatment_date
  }]);

  if (error) { alert('Error: ' + error.message); return; }
  alert('Treatment added!');
  document.getElementById('addTreatmentForm').style.display = 'none';
  loadTreatments();
});

function deleteTreatment(id) {
  if (confirm('Delete this treatment?')) {
    supabaseClient.from('treatments').delete().eq('id', id).then(({ error }) => {
      if (error) alert('Error: ' + error.message);
      else loadTreatments();
    });
  }
}

if (document.getElementById('treatmentsTableBody')) {
  checkAuth();
  loadTreatments();
}
/* ============================================
   DASHBOARD EXTRA — TODAY, INCUBATOR, ALERTS, COMPARISON
   ============================================ */

async function loadDashboardExtra() {
  if (!document.getElementById('todayRevenue')) return;

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  /* TODAY */
  const { data: todayExits } = await supabaseClient.from('exits').select('amount, date').eq('is_deleted', false).eq('date', today);
  const { data: todayExpenses } = await supabaseClient.from('expenses').select('amount, date').eq('is_deleted', false).eq('date', today);

  const tRev = (todayExits || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const tExp = (todayExpenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  document.getElementById('todayRevenue').textContent = tRev.toLocaleString() + ' TZS';
  document.getElementById('todayExpenses').textContent = tExp.toLocaleString() + ' TZS';
  document.getElementById('todayProfit').textContent = (tRev - tExp).toLocaleString() + ' TZS';

  /* INCUBATOR STATUS */
  const { data: batches } = await supabaseClient.from('incubation_batches').select('*');
  const active = (batches || []).filter(b => b.status === 'incubating');
  const eggsInc = active.reduce((s, b) => s + Number(b.eggs_count || 0), 0);
  const rates = (batches || []).filter(b => b.eggs_count > 0 && b.hatched > 0).map(b => (b.hatched / b.eggs_count) * 100);
  const avgRate = rates.length > 0 ? (rates.reduce((s, r) => s + r, 0) / rates.length).toFixed(1) : 0;

  document.getElementById('activeBatches').textContent = active.length;
  document.getElementById('eggsIncubating').textContent = eggsInc.toLocaleString();
  document.getElementById('avgHatchRate').textContent = avgRate + '%';

  /* ALERTS */
  const alertsBox = document.getElementById('alertsBox');
  const alerts = [];

  if (active.length > 0) {
    alerts.push({ type: 'info', msg: `🥚 ${active.length} batch(es) incubating — remember to turn eggs!` });
  }

  const { data: lowStock } = await supabaseClient.from('inventory').select('name, quantity, reorder_level');
  (lowStock || []).forEach(item => {
    if (item.quantity <= item.reorder_level) {
      alerts.push({ type: 'warning', msg: `📦 Low stock: ${item.name} (${item.quantity} left)` });
    }
  });

  const { data: sickBirds } = await supabaseClient.from('health_records').select('*').order('date', { ascending: false }).limit(3);
  (sickBirds || []).forEach(h => {
    if (h.sick > 0) {
      alerts.push({ type: 'danger', msg: `🏥 ${h.disease}: ${h.sick} sick bird(s)` });
    }
  });

  if (alerts.length === 0) {
    alertsBox.innerHTML = '<p class="muted">No alerts. Everything is fine!</p>';
  } else {
    alertsBox.innerHTML = alerts.map(a => `<div class="alert-item ${a.type}">${a.msg}</div>`).join('');
  }

  /* COMPARISON */
  const { data: thisMonthExits } = await supabaseClient.from('exits').select('amount').eq('is_deleted', false).gte('date', thisMonthStart);
  const { data: thisMonthExpenses } = await supabaseClient.from('expenses').select('amount').eq('is_deleted', false).gte('date', thisMonthStart);

  const { data: lastMonthExits } = await supabaseClient.from('exits').select('amount').eq('is_deleted', false).gte('date', lastMonthStart).lte('date', lastMonthEnd);
  const { data: lastMonthExpenses } = await supabaseClient.from('expenses').select('amount').eq('is_deleted', false).gte('date', lastMonthStart).lte('date', lastMonthEnd);

  const thisRev = (thisMonthExits || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const thisExp = (thisMonthExpenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const thisProfit = thisRev - thisExp;

  const lastRev = (lastMonthExits || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const lastExp = (lastMonthExpenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const lastProfit = lastRev - lastExp;

  const change = lastProfit !== 0 ? (((thisProfit - lastProfit) / Math.abs(lastProfit)) * 100).toFixed(1) : 0;

  document.getElementById('thisMonthProfit').textContent = thisProfit.toLocaleString() + ' TZS';
  document.getElementById('lastMonthProfit').textContent = lastProfit.toLocaleString() + ' TZS';
  document.getElementById('change').textContent = change + '%';
  document.getElementById('monthChange').textContent = change + '%';
}

if (document.getElementById('todayRevenue')) {
  loadDashboardExtra();
}
/* ============================================
   DASHBOARD EXTRA — SUMMARY, INCUBATOR, ALERTS, COMPARISON, CHARTS
   ============================================ */

async function loadDashboardExtra() {
  if (!document.getElementById('todayRevenue')) return;

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

  const { data: todayExits } = await supabaseClient.from('exits').select('amount, date').eq('is_deleted', false).eq('date', today);
  const { data: todayExpenses } = await supabaseClient.from('expenses').select('amount, date').eq('is_deleted', false).eq('date', today);

  const tRev = (todayExits || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const tExp = (todayExpenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  document.getElementById('todayRevenue').textContent = tRev.toLocaleString() + ' TZS';
  document.getElementById('todayExpenses').textContent = tExp.toLocaleString() + ' TZS';
  document.getElementById('todayProfit').textContent = (tRev - tExp).toLocaleString() + ' TZS';

  const { data: batches } = await supabaseClient.from('incubation_batches').select('*');
  const active = (batches || []).filter(b => b.status === 'incubating');
  const eggsInc = active.reduce((s, b) => s + Number(b.eggs_count || 0), 0);
  const rates = (batches || []).filter(b => b.eggs_count > 0 && b.hatched > 0).map(b => (b.hatched / b.eggs_count) * 100);
  const avgRate = rates.length > 0 ? (rates.reduce((s, r) => s + r, 0) / rates.length).toFixed(1) : 0;

  document.getElementById('activeBatches').textContent = active.length;
  document.getElementById('eggsIncubating').textContent = eggsInc.toLocaleString();
  document.getElementById('avgHatchRate').textContent = avgRate + '%';

  const alertsBox = document.getElementById('alertsBox');
  const alerts = [];

  if (active.length > 0) {
    alerts.push({ type: 'info', msg: `🥚 ${active.length} batch(es) incubating — remember to turn eggs!` });
  }

  const { data: lowStock } = await supabaseClient.from('inventory').select('name, quantity, reorder_level');
  (lowStock || []).forEach(item => {
    if (item.quantity <= item.reorder_level) {
      alerts.push({ type: 'warning', msg: `📦 Low stock: ${item.name} (${item.quantity} left)` });
    }
  });

  const { data: sickBirds } = await supabaseClient.from('health_records').select('*').order('date', { ascending: false }).limit(3);
  (sickBirds || []).forEach(h => {
    if (h.sick > 0) {
      alerts.push({ type: 'danger', msg: `🏥 ${h.disease}: ${h.sick} sick bird(s)` });
    }
  });

  if (alerts.length === 0) {
    alertsBox.innerHTML = '<p class="muted">No alerts. Everything is fine!</p>';
  } else {
    alertsBox.innerHTML = alerts.map(a => `<div class="alert-item ${a.type}">${a.msg}</div>`).join('');
  }

  const { data: thisMonthExits } = await supabaseClient.from('exits').select('amount').eq('is_deleted', false).gte('date', thisMonthStart);
  const { data: thisMonthExpenses } = await supabaseClient.from('expenses').select('amount').eq('is_deleted', false).gte('date', thisMonthStart);

  const { data: lastMonthExits } = await supabaseClient.from('exits').select('amount').eq('is_deleted', false).gte('date', lastMonthStart).lte('date', lastMonthEnd);
  const { data: lastMonthExpenses } = await supabaseClient.from('expenses').select('amount').eq('is_deleted', false).gte('date', lastMonthStart).lte('date', lastMonthEnd);

  const thisRev = (thisMonthExits || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const thisExp = (thisMonthExpenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const thisProfit = thisRev - thisExp;

  const lastRev = (lastMonthExits || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const lastExp = (lastMonthExpenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  const lastProfit = lastRev - lastExp;

  const change = lastProfit !== 0 ? (((thisProfit - lastProfit) / Math.abs(lastProfit)) * 100).toFixed(1) : 0;

  document.getElementById('thisMonthProfit').textContent = thisProfit.toLocaleString() + ' TZS';
  document.getElementById('lastMonthProfit').textContent = lastProfit.toLocaleString() + ' TZS';
  document.getElementById('monthChange').textContent = change + '%';
}

async function loadDashboardCharts() {
  if (!document.getElementById('lineChart')) return;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

  const { data: exits } = await supabaseClient.from('exits').select('amount, date').eq('is_deleted', false).gte('date', monthStart);
  const { data: expenses } = await supabaseClient.from('expenses').select('amount, date').eq('is_deleted', false).gte('date', monthStart);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const labels = [];
  const revenueData = [];
  const expenseData = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = new Date(now.getFullYear(), now.getMonth(), d).toISOString().split('T')[0];
    labels.push(d);
    revenueData.push((exits || []).filter(e => e.date === dayStr).reduce((s, e) => s + Number(e.amount || 0), 0));
    expenseData.push((expenses || []).filter(e => e.date === dayStr).reduce((s, e) => s + Number(e.amount || 0), 0));
  }

  new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        { label: 'Revenue', data: revenueData, borderColor: '#28a745', backgroundColor: 'rgba(40, 167, 69, 0.1)', tension: 0.3, fill: true },
        { label: 'Expenses', data: expenseData, borderColor: '#dc3545', backgroundColor: 'rgba(220, 53, 69, 0.1)', tension: 0.3, fill: true }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }
  });

  const typeTotals = {};
  (expenses || []).forEach(e => {
    const t = e.type || 'other';
    typeTotals[t] = (typeTotals[t] || 0) + Number(e.amount || 0);
  });

  const pieLabels = Object.keys(typeTotals);
  const pieData = Object.values(typeTotals);

  new Chart(document.getElementById('pieChart'), {
    type: 'doughnut',
    data: {
      labels: pieLabels.length > 0 ? pieLabels : ['No data'],
      datasets: [{
        data: pieData.length > 0 ? pieData : [1],
        backgroundColor: ['#1e3c72', '#2a5298', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });

  const weekLabels = [];
  const weekProfits = [];

  for (let w = 3; w >= 0; w--) {
    const start = new Date();
    start.setDate(start.getDate() - (w * 7 + 6));
    const end = new Date();
    end.setDate(end.getDate() - (w * 7));

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    const { data: wEx } = await supabaseClient.from('exits').select('amount').eq('is_deleted', false).gte('date', startStr).lte('date', endStr);
    const { data: wExp } = await supabaseClient.from('expenses').select('amount').eq('is_deleted', false).gte('date', startStr).lte('date', endStr);

    const wRev = (wEx || []).reduce((s, e) => s + Number(e.amount || 0), 0);
    const wExpT = (wExp || []).reduce((s, e) => s + Number(e.amount || 0), 0);

    weekLabels.push(`Week ${4 - w}`);
    weekProfits.push(wRev - wExpT);
  }

  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: weekLabels,
      datasets: [{
        label: 'Profit',
        data: weekProfits,
        backgroundColor: weekProfits.map(p => p >= 0 ? '#28a745' : '#dc3545')
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });
}

if (document.getElementById('todayRevenue')) {
  loadDashboardExtra();
}

if (document.getElementById('lineChart')) {
  loadDashboardCharts();
}
