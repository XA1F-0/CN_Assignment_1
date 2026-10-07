// Each function handles one API endpoint: read the request, run SQL, send the response.
const db = require('../db');

const FIELDS = ['title', 'description', 'research_area', 'faculty_name', 'department',
                'required_skills', 'available_positions', 'application_deadline', 'status'];

// Checks the request body. Returns a list of error messages (empty list = valid).
function validate(body) {
  const errors = [];

  for (const field of ['title', 'description', 'research_area', 'faculty_name', 'department', 'required_skills']) {
    if (typeof body[field] !== 'string' || body[field].trim() === '') {
      errors.push(`${field} is required.`);
    }
  }

  if (!Number.isInteger(body.available_positions) || body.available_positions <= 0) {
    errors.push('available_positions must be a positive whole number.');
  }

  const date = body.application_deadline;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(new Date(date))) {
    errors.push('application_deadline must be a valid date (YYYY-MM-DD).');
  }

  if (body.status !== 'Open' && body.status !== 'Closed') {
    errors.push("status must be either 'Open' or 'Closed'.");
  }

  return errors;
}

// Turns the request body into an array of values in the same order as FIELDS.
function valuesFrom(body) {
  return FIELDS.map((f) => (typeof body[f] === 'string' ? body[f].trim() : body[f]));
}

function serverError(res, err) {
  console.error(err); // details only in the server console, never sent to the user
  res.status(500).json({ message: 'Internal server error.' });
}

// POST /api/opportunities
exports.createOpportunity = async (req, res) => {
  const errors = validate(req.body);
  if (errors.length > 0) return res.status(400).json({ message: 'Invalid input.', errors });

  try {
    const sql = `INSERT INTO research_opportunities (${FIELDS.join(', ')}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, valuesFrom(req.body));
    const [rows] = await db.query('SELECT * FROM research_opportunities WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    serverError(res, err);
  }
};

// GET /api/opportunities
exports.getAllOpportunities = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM research_opportunities ORDER BY id');
    res.status(200).json(rows);
  } catch (err) {
    serverError(res, err);
  }
};

// GET /api/opportunities/:id
exports.getOpportunityById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM research_opportunities WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Research opportunity not found.' });
    res.status(200).json(rows[0]);
  } catch (err) {
    serverError(res, err);
  }
};

// PUT /api/opportunities/:id   (send all fields; to close an opportunity send status "Closed")
exports.updateOpportunity = async (req, res) => {
  const errors = validate(req.body);
  if (errors.length > 0) return res.status(400).json({ message: 'Invalid input.', errors });

  try {
    const sql = `UPDATE research_opportunities SET ${FIELDS.map((f) => f + ' = ?').join(', ')} WHERE id = ?`;
    const [result] = await db.query(sql, [...valuesFrom(req.body), req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Research opportunity not found.' });

    const [rows] = await db.query('SELECT * FROM research_opportunities WHERE id = ?', [req.params.id]);
    res.status(200).json(rows[0]);
  } catch (err) {
    serverError(res, err);
  }
};

// DELETE /api/opportunities/:id
exports.deleteOpportunity = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM research_opportunities WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Research opportunity not found.' });
    res.status(200).json({ message: 'Research opportunity deleted.' });
  } catch (err) {
    serverError(res, err);
  }
};
