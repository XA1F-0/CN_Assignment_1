// The frontend talks to the backend only through fetch() calls to the REST API.
const API_URL = 'http://localhost:3000/api/opportunities';

const FIELDS = ['title', 'description', 'research_area', 'faculty_name', 'department',
                'required_skills', 'available_positions', 'application_deadline', 'status'];

let opportunities = [];  // the list last received from the server
let editingId = null;    // null = adding a new one, otherwise the id being edited

// ----- show a success or error message -----
function showMessage(text, type) {
  const box = document.getElementById('message');
  box.textContent = text;
  box.className = type; // "success" or "error"
}

// ----- make text safe before putting it into HTML -----
function safe(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ----- send a request to the API; returns the JSON, or throws an Error with a readable message -----
async function callApi(url, method = 'GET', body = null) {
  let response;
  try {
    response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Cannot connect to the server. Is the backend running?');
  }
  const data = await response.json();
  if (!response.ok) {
    const details = data.errors ? ' ' + data.errors.join(' ') : '';
    throw new Error(data.message + details);
  }
  return data;
}

// ----- 1. display all opportunities (GET /api/opportunities) -----
async function loadOpportunities() {
  try {
    opportunities = await callApi(API_URL);
    const body = document.getElementById('tableBody');
    if (opportunities.length === 0) {
      body.innerHTML = '<tr><td colspan="6">No opportunities yet. Add one below.</td></tr>';
      return;
    }
    body.innerHTML = opportunities.map((o) => `
      <tr>
        <td>${o.id}</td>
        <td>${safe(o.title)}</td>
        <td>${safe(o.faculty_name)}</td>
        <td>${o.application_deadline}</td>
        <td>${o.status}</td>
        <td>
          <button onclick="viewDetails(${o.id})">View</button>
          <button onclick="startEdit(${o.id})">Edit</button>
          ${o.status === 'Open' ? `<button onclick="closeOpportunity(${o.id})">Close</button>` : ''}
          <button onclick="deleteOpportunity(${o.id})">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    showMessage(err.message, 'error');
  }
}

// ----- 2. show full details (GET /api/opportunities/:id) -----
async function viewDetails(id) {
  try {
    const o = await callApi(`${API_URL}/${id}`);
    const box = document.getElementById('details');
    box.hidden = false;
    box.innerHTML = `
      <h3>${safe(o.title)}</h3>
      <p>${safe(o.description)}</p>
      <p><b>Research area:</b> ${safe(o.research_area)}<br>
         <b>Faculty:</b> ${safe(o.faculty_name)}<br>
         <b>Department:</b> ${safe(o.department)}<br>
         <b>Required skills:</b> ${safe(o.required_skills)}<br>
         <b>Available positions:</b> ${o.available_positions}<br>
         <b>Deadline:</b> ${o.application_deadline}<br>
         <b>Status:</b> ${o.status}</p>
      <button onclick="document.getElementById('details').hidden = true">Hide</button>`;
  } catch (err) {
    showMessage(err.message, 'error');
    loadOpportunities();
  }
}

// ----- 3 & 4. create or update (POST / PUT) -----
document.getElementById('form').addEventListener('submit', async (event) => {
  event.preventDefault();

  // read the form values
  const data = {};
  FIELDS.forEach((f) => (data[f] = document.getElementById(f).value.trim()));
  data.available_positions = Number(data.available_positions);

  // basic form validation
  for (const f of FIELDS) {
    if (data[f] === '') return showMessage(`Please fill in: ${f.replace('_', ' ')}.`, 'error');
  }
  if (!Number.isInteger(data.available_positions) || data.available_positions <= 0) {
    return showMessage('Available positions must be a positive whole number.', 'error');
  }

  try {
    if (editingId) {
      await callApi(`${API_URL}/${editingId}`, 'PUT', data);
      showMessage('Opportunity updated successfully.', 'success');
    } else {
      await callApi(API_URL, 'POST', data);
      showMessage('Opportunity created successfully.', 'success');
    }
    resetForm();
    loadOpportunities();
  } catch (err) {
    showMessage(err.message, 'error');
  }
});

// ----- fill the form to edit an existing opportunity -----
function startEdit(id) {
  const o = opportunities.find((item) => item.id === id);
  FIELDS.forEach((f) => (document.getElementById(f).value = o[f]));
  editingId = id;
  document.getElementById('formTitle').textContent = `Edit Opportunity #${id}`;
  document.getElementById('saveBtn').textContent = 'Update';
  document.getElementById('cancelBtn').hidden = false;
  document.getElementById('form').scrollIntoView();
}

function resetForm() {
  document.getElementById('form').reset();
  editingId = null;
  document.getElementById('formTitle').textContent = 'Add Opportunity';
  document.getElementById('saveBtn').textContent = 'Save';
  document.getElementById('cancelBtn').hidden = true;
}
document.getElementById('cancelBtn').addEventListener('click', resetForm);

// ----- 5. change Open -> Closed (PUT with status "Closed") -----
async function closeOpportunity(id) {
  const o = opportunities.find((item) => item.id === id);
  const updated = {};
  FIELDS.forEach((f) => (updated[f] = o[f]));
  updated.status = 'Closed';
  try {
    await callApi(`${API_URL}/${id}`, 'PUT', updated);
    showMessage('Opportunity closed.', 'success');
  } catch (err) {
    showMessage(err.message, 'error');
  }
  loadOpportunities();
}

// ----- 6. delete (DELETE /api/opportunities/:id) -----
async function deleteOpportunity(id) {
  if (!confirm('Delete this opportunity?')) return;
  try {
    await callApi(`${API_URL}/${id}`, 'DELETE');
    showMessage('Opportunity deleted.', 'success');
  } catch (err) {
    showMessage(err.message, 'error');
  }
  loadOpportunities();
}

loadOpportunities(); // runs when the page opens
