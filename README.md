# University Research Opportunity Portal

**GitHub Repository:** https://github.com/XA1F-0/CN_Assignment_1
## Project description
A web application where faculty members post, view, update, close and delete research opportunities in one place. It replaces scattered emails, WhatsApp groups and noticeboards. Computer Networks Assignment 1.

## Technologies
| Part | Technology |
|---|---|
| Backend | Node.js + Express.js (REST API) |
| Database | MySQL |
| Frontend | HTML, CSS, vanilla JavaScript (`fetch()`) |
| Testing | Postman |
| Version control | Git + GitHub |

## Features
- Create, read (all / one), update and delete research opportunities (CRUD) stored in MySQL
- Change an opportunity from Open to Closed
- Backend validation (400), not-found handling (404) and server error handling (500)
- Frontend with a table, a details view, a form with basic validation, and success/error messages

## Project structure
```
research-opportunity-portal/
├── backend/
│   ├── server.js                         starts Express, CORS, serves the frontend
│   ├── db.js                             MySQL connection (reads .env)
│   ├── routes/opportunityRoutes.js       URL + HTTP method -> function
│   └── controllers/opportunityController.js   validation, SQL, responses
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js                         fetch() calls to the API
├── database/schema.sql
├── postman/Research-Opportunity-Portal.postman_collection.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## How to run the project

Requirements: Node.js 18+ and MySQL installed and running.

**1. Install dependencies**
```bash
npm install
```

**2. Create the MySQL database and table**
```bash
mysql -u root -p < database/schema.sql
```

**3. Set environment variables**
```bash
cp .env.example .env        # Windows: copy .env.example .env
```
Open `.env` and set `DB_PASSWORD` to your MySQL password:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=research_portal
DB_PORT=3306
PORT=3000
```
`.env` is listed in `.gitignore`, so passwords are never pushed to GitHub.

**4. Start the backend**
```bash
npm start
```
You should see: `Server running at http://localhost:3000`

**5. Open the frontend**
Go to **http://localhost:3000** in a browser. (Express serves the files in `frontend/`.)
The frontend can also be opened from another port (for example VS Code Live Server). It still works because CORS is enabled.

## API endpoints
Base URL: `http://localhost:3000/api/opportunities`

| Method | Endpoint | Description | Success | Errors |
|---|---|---|---|---|
| POST | `/api/opportunities` | Create | 201 | 400, 500 |
| GET | `/api/opportunities` | Get all | 200 | 500 |
| GET | `/api/opportunities/:id` | Get one | 200 | 404, 500 |
| PUT | `/api/opportunities/:id` | Update (send all fields) | 200 | 400, 404, 500 |
| DELETE | `/api/opportunities/:id` | Delete | 200 | 404, 500 |

Example request body (POST and PUT):
```json
{
  "title": "Federated Learning for Medical Imaging",
  "description": "Train image models across hospitals without sharing patient data.",
  "research_area": "Machine Learning",
  "faculty_name": "Dr. Ayesha Khan",
  "department": "Computer Science",
  "required_skills": "Python, PyTorch, Statistics",
  "available_positions": 2,
  "application_deadline": "2026-12-15",
  "status": "Open"
}
```
Error example: `{ "message": "Research opportunity not found." }`

Validation rules: all fields are required; `available_positions` must be a positive whole number; `application_deadline` must be a valid `YYYY-MM-DD` date; `status` must be `Open` or `Closed`.

## Postman testing
1. Start the backend.
2. In Postman choose **Import** and select `postman/Research-Opportunity-Portal.postman_collection.json`.
3. Run requests **1 to 10 in order** (or use the Collection Runner):
   create x3, get all, get one, update, Open to Closed, delete, get deleted (404), invalid data (400).

## How it works (Computer Networks concepts)

```
Browser (Frontend)
   |  HTTP request (e.g. POST, JSON body)
   v
Express server (port 3000)
   |  SQL query
   v
MySQL (port 3306)
   |  result rows
   v
Express server
   |  HTTP response (status code + JSON)
   v
Browser (Frontend)
```

- **Client-server architecture:** the browser (client) requests data; the Express program (server) listens for requests and replies.
- **HTTP:** the application-layer protocol used between browser and server. It runs over TCP.
- **REST API:** URLs name resources (`/api/opportunities`) and HTTP methods say the action: POST = create, GET = read, PUT = update, DELETE = delete.
- **Status codes:** 200 OK, 201 Created, 400 Bad Request (client sent bad data), 404 Not Found, 500 Internal Server Error (server fault).
- **JSON:** the text format used for request and response bodies.
- **localhost and ports:** `localhost` means this computer. The port picks the program: 3000 for Express, 3306 for MySQL.
- **Request/response cycle:** every action is one request followed by one response.
- **CORS:** browsers block a page from calling a server on a different origin (different port counts) unless the server allows it. `app.use(cors())` allows it.
- **Frontend to backend:** JavaScript `fetch()` sends HTTP requests to the API.
- **Backend to database:** `mysql2` sends SQL (INSERT, SELECT, UPDATE, DELETE) to MySQL.
