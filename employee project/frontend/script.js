

const baseURL = "http://localhost:8000"; // change if needed

// app state
let state = {
  role: null,
  employeeId: null,
  name: null,
  employees: [],
  tasks: [],
};

// helpers
const $ = id => document.getElementById(id);
const toast = (msg, success = true) => {
  const t = $("toast");
  t.textContent = msg;
  t.style.background = success ? "#e6ffed" : "#ffe6e6";
  t.style.color = success ? "#085f2b" : "#7a0b0b";
  t.classList.remove("hidden");
  setTimeout(()=> t.classList.add("hidden"), 3000);
};

const showModal = (id) => $(id).classList.remove("hidden");
const hideModal = (id) => $(id).classList.add("hidden");
const show = el => el.classList.remove("hidden");
const hide = el => el.classList.add("hidden");

// ---------- Authentication ----------
async function initLoginHandlers(){
  $("btn-login").addEventListener("click", login);
  $("btn-open-register").addEventListener("click", openRegisterDemo);
}

async function login(){
  const email = $("login-email").value.trim();
  const password = $("login-password").value.trim();
  const demoRole = $("login-role").value; // demo only; backend will enforce role in real setup

  if(!email || !password){ toast("Email & password required", false); return; }

  try {
    const res = await fetch(`${baseURL}/login`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ email, password })
    });

    if(!res.ok){
      const err = await res.json().catch(()=>({detail:"Login failed"}));
      toast(err.detail || err.message || "Invalid credentials", false);
      return;
    }

    const data = await res.json();
    // backend returns employee_id & role & name
    state.role = data.role || demoRole || "employee";
    state.employeeId = data.employee_id ?? null;
    state.name = data.name ?? "";
    afterLogin();
    toast(`Welcome ${data.name || "user"}`);
  } catch (err) {
    console.error(err);
    toast("Login error", false);
  }
}

// very small helper to create a demo user via register endpoint
async function openRegisterDemo(){
  const name = prompt("Demo name (eg. Akash)", "Demo User");
  const email = prompt("Demo email (eg. demo1@example.com)", `demo${Date.now()%1000}@example.com`);
  const password = prompt("Password (eg. pass123)", "pass123");
  if(!name || !email || !password) return;
  try {
    const res = await fetch(`${baseURL}/register`, {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ name, email, position: "Demo", password })
    });
    if(!res.ok){ const e = await res.json().catch(()=>({detail:"err"})); toast(e.detail || "Register failed", false); return; }
    const emp = await res.json();
    toast(`Created ${emp.name}`);
  } catch(e){ toast("Register failed", false); }
}

// ---------- UI state after login ----------
function afterLogin(){
  // hide login and show dashboard
  $("login-page").classList.remove("active");
  $("login-page").classList.add("hidden");
  $("topbar").classList.remove("hidden");
  $("dashboard").classList.remove("hidden");
  $("top-user").textContent = `${state.name || ""} (${state.role})`;

  setupNav();
  setupButtons();
  loadInitialData();
}

// ---------- Navigation & buttons ----------
function setupNav(){
  // admin sees both, employee sees only tasks
  const navEmployees = $("nav-employees");
  const navTasks = $("nav-tasks");

  if(state.role === "admin"){
    navEmployees.classList.remove("hidden");
    navTasks.classList.remove("hidden");
    navEmployees.classList.add("active");
    show($("employees-view"));
    hide($("tasks-view"));
  } else {
    // employee
    hide($("nav-employees"));
    show($("tasks-view"));
    hide($("employees-view"));
    navTasks.classList.add("active");
  }
}

function setupButtons(){
  $("btn-logout").addEventListener("click", logout);
  $("btn-add-employee").addEventListener("click", ()=> openEmployeeModal());
  $("emp-cancel").addEventListener("click", ()=> hideModal("modal-employee"));
  $("emp-save").addEventListener("click", saveEmployee);

  $("btn-add-task").addEventListener("click", ()=> openTaskModal());
  $("task-cancel").addEventListener("click", ()=> hideModal("modal-task"));
  $("task-save").addEventListener("click", saveTask);

  // navigation listeners
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", (e)=>{
      document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      const target = e.currentTarget.dataset.target;
      // show/hide views
      document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      if(target === "employees-view"){ show($("employees-view")); } else { show($("tasks-view")); }
      // reload list
      if(target === "employees-view") loadEmployees();
      if(target === "tasks-view") loadTasks();
    });
  });

  // search / filter handlers
  $("search-employee").addEventListener("input", loadEmployees);
  $("search-task").addEventListener("input", loadTasks);
  $("filter-employee").addEventListener("change", loadTasks);
  $("filter-status").addEventListener("change", loadTasks);
}

// ---------- Logout ----------
function logout(){
  state.role = null;
  state.employeeId = null;
  state.name = null;
  // show login again
  $("topbar").classList.add("hidden");
  $("dashboard").classList.add("hidden");
  $("login-page").classList.add("active");
  $("login-page").classList.remove("hidden");
  toast("Logged out");
}

// ---------- Employees CRUD (admin) ----------
async function loadEmployees(){
  if(state.role !== "admin") return;
  try {
    const res = await fetch(`${baseURL}/employees`);
    if(!res.ok) throw new Error("Failed");
    const data = await res.json();
    state.employees = data;
    renderEmployees();
    populateEmployeeFilter();
  } catch(e){ toast("Failed to load employees", false); console.error(e); }
}

function renderEmployees(){
  const tbody = $("employees-tbody");
  tbody.innerHTML = "";
  const q = $("search-employee").value.trim().toLowerCase();
  const rows = state.employees.filter(emp => !q || emp.name.toLowerCase().includes(q) || (emp.email && emp.email.toLowerCase().includes(q)));
  rows.forEach(emp => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.email}</td>
      <td>${emp.position || ""}</td>
      <td>${emp.role || "employee"}</td>
      <td>
        <button class="btn" onclick="onEditEmployee(${emp.id})">Edit</button>
        <button class="btn ghost" onclick="onDeleteEmployee(${emp.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function populateEmployeeFilter(){
  const select = $("filter-employee");
  select.innerHTML = '<option value="">All employees</option>';
  state.employees.forEach(e => {
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = `${e.name} (${e.id})`;
    select.appendChild(opt);
  });
}

function openEmployeeModal(emp = null){
  if(state.role !== "admin") return;
  $("emp-id").value = emp ? emp.id : "";
  $("emp-name").value = emp ? emp.name : "";
  $("emp-email").value = emp ? emp.email : "";
  $("emp-position").value = emp ? emp.position || "" : "";
  $("emp-password").value = "";
  $("emp-modal-title").textContent = emp ? "Edit Employee" : "Add Employee";
  showModal("modal-employee");
}

async function onEditEmployee(id){
    try {
        const res = await fetch(`${baseURL}/employees/${id}`);
        if (!res.ok) throw new Error("Employee not found");

        const emp = await res.json();
        openEmployeeModal(emp);

    } catch (err) {
        notify("Error loading employee for editing", false);
        console.error(err);
    }
}


async function onDeleteEmployee(id){
  if(!confirm("Delete employee and their tasks?")) return;
  try {
    const res = await fetch(`${baseURL}/employees/${id}`, { method:"DELETE" });
    if(!res.ok) throw new Error("Delete failed");
    toast("Deleted employee");
    await loadEmployees();
  } catch(e){ toast("Delete failed", false); }
}

async function saveEmployee(){
  if(state.role !== "admin") return;
  const id = $("emp-id").value;
  const payload = {
    name: $("emp-name").value.trim(),
    email: $("emp-email").value.trim(),
    position: $("emp-position").value.trim()
  };
  const pass = $("emp-password").value;
  if(pass) payload.password = pass;

  // Simple validation
  if(!payload.name || !payload.email){ toast("Name & email required", false); return; }

  try {
    let res;
    if(id){
      res = await fetch(`${baseURL}/employees/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(`${baseURL}/register`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)
      });
    }
    if(!res.ok){
      const err = await res.json().catch(()=>({detail:"error"}));
      toast(err.detail || "Save failed", false);
      return;
    }
    const saved = await res.json();
    toast(`Saved ${saved.name}`);
    hideModal("modal-employee");
    await loadEmployees();
  } catch(e){ toast("Save failed", false); console.error(e); }
}

// ---------- Tasks CRUD ----------
async function loadTasks(){
  try {
    let res;
    if(state.role === "admin"){
      res = await fetch(`${baseURL}/tasks`);
    } else {
      res = await fetch(`${baseURL}/my-tasks?employee_id=${state.employeeId}`);
    }
    if(!res.ok) throw new Error("Failed to load tasks");
    const data = await res.json();
    state.tasks = data;
    renderTasks();
  } catch(e){ toast("Failed to load tasks", false); console.error(e); }
}

function renderTasks(){
  const tbody = $("tasks-tbody");
  tbody.innerHTML = "";
  const q = $("search-task").value.trim().toLowerCase();
  const filterEmp = $("filter-employee").value;
  const filterStatus = $("filter-status").value;

  let rows = state.tasks.filter(t => {
    if(q && !t.title.toLowerCase().includes(q)) return false;
    if(filterEmp && String(t.employee_id) !== String(filterEmp)) return false;
    if(filterStatus && String(t.completed) !== filterStatus) return false;
    return true;
  });

  rows.forEach(task => {
    const tr = document.createElement("tr");
    const assigned = task.employee_id ? task.employee_id : "";
    tr.innerHTML = `
      <td>${task.id}</td>
      <td>${escapeHtml(task.title)}</td>
      <td>${escapeHtml(task.description || "")}</td>
      <td>${state.role === "admin" ? assigned : ""}</td>
      <td>${task.completed}</td>
      <td>
        <button class="btn" onclick="onEditTask(${task.id})">${state.role==="admin" ? "Edit" : "Update Status"}</button>
        ${state.role==="admin" ? `<button class="btn ghost" onclick="onDeleteTask(${task.id})">Delete</button>` : ""}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// simple HTML escape
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[c])); }

function openTaskModal(task = null){
  // Admin can create; employees only can open to update status
  if(!task && state.role !== "admin"){ toast("Only admin can create tasks", false); return; }
  $("task-id").value = task ? task.id : "";
  $("task-title").value = task ? task.title : "";
  $("task-desc").value = task ? task.description || "" : "";
  $("task-employee").value = task ? (task.employee_id || "") : (state.role==="employee" ? state.employeeId : "");
  $("task-completed").value = task ? String(task.completed) : "false";
  // role-based field access
  if(state.role === "employee"){
    $("task-title").disabled = true;
    $("task-desc").disabled = true;
    $("task-employee").disabled = true;
  } else {
    $("task-title").disabled = false;
    $("task-desc").disabled = false;
    $("task-employee").disabled = false;
  }
  showModal("modal-task");
}

function onEditTask(id){
  const task = state.tasks.find(t=>t.id===id);
  if(!task) return;
  openTaskModal(task);
}

async function onDeleteTask(id){
  if(!confirm("Delete task?")) return;
  try {
    const res = await fetch(`${baseURL}/tasks/${id}`, { method:"DELETE" });
    if(!res.ok) throw new Error("Delete failed");
    toast("Task deleted");
    await loadTasks();
  } catch(e){ toast("Delete failed", false); }
}

async function saveTask(){
  const id = $("task-id").value;
  let payload = {};
  if(state.role === "admin"){
    payload = {
      title: $("task-title").value.trim(),
      description: $("task-desc").value.trim(),
      employee_id: $("task-employee").value ? Number($("task-employee").value) : null,
      completed: $("task-completed").value === "true"
    };
    if(!payload.title){ toast("Title required", false); return; }
  } else {
    // employee can only change completed
    payload = { completed: $("task-completed").value === "true" };
  }

  try {
    let res;
    if(id){
      res = await fetch(`${baseURL}/tasks/${id}`, {
        method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)
      });
    } else {
      // create
      res = await fetch(`${baseURL}/tasks`, {
        method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload)
      });
    }
    if(!res.ok){ const err = await res.json().catch(()=>({detail:"err"})); toast(err.detail || "Save failed", false); return; }
    const saved = await res.json();
    toast(`Saved task ${saved.id}`);
    hideModal("modal-task");
    await loadTasks();
  } catch(e){ toast("Save failed", false); console.error(e); }
}

// ---------- helpers ----------
function escapeInput(s){ return (s||"").toString(); }

// initial load after login
async function loadInitialData(){
  // Always load tasks; admins also load employees & populate filters
  await loadTasks();
  if(state.role === "admin") await loadEmployees();
}


// init
window.addEventListener("DOMContentLoaded", async () => {
  await initLoginHandlers();
  // attach simple handlers for modals cancel
  // ensure nav buttons exist when page not yet visible
  $("nav-employees").addEventListener("click", ()=> { document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active")); $("nav-employees").classList.add("active"); document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden")); show($("employees-view")); loadEmployees(); });
  $("nav-tasks").addEventListener("click", ()=> { document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active")); $("nav-tasks").classList.add("active"); document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden")); show($("tasks-view")); loadTasks(); });

  // hide topbar/dashboard initially
  $("topbar").classList.add("hidden");
  $("dashboard").classList.add("hidden");
});
