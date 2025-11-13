# SQL Runner - Full-Stack Application

A modern, feature-rich SQL query runner built with Next.js (frontend), FastAPI (backend), and SQLite database. Execute SQL queries, explore database tables, and manage user authentication.

## Features

### Core Features
- **Query Execution**: Type and execute SQL queries against a SQLite database
- **Results Display**: View query results in a clean, formatted table
- **Available Tables**: Browse all database tables in the left sidebar
- **Table Preview**: View table schema (column names & data types) and sample rows (first 5)
- **Recent Queries**: Track and view your last 10 executed queries

### Authentication Features
- **User Registration**: Create new user accounts
- **User Login**: Secure login with username and password
- **Forgot Password**: Reset password if forgotten
- **User Profile**: View profile information including member since date, total queries, and last login
- **Logout**: Securely log out of your session

### Bonus Features
- **Authentication System**: User registration, login, password reset
- **Recent Queries Tracking**: View history of executed queries per user
- **Dockerization**: Fully containerized with Docker Compose for easy deployment

## Technologies Used

**Frontend:**
- Next.js 16
- React 19
- Material-UI (MUI) for modern UI components
- TypeScript for type safety

**Backend:**
- FastAPI 0.121.1
- Python 3.14
- SQLite3 for database
- JWT authentication

**DevOps:**
- Docker & Docker Compose for containerization

**Database:**
- SQLite with pre-configured sample data (Customers, Orders, Shippings tables)

## Project Structure

```
sql/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── db.py                   # SQLite database utilities
│   ├── requirements.txt         # Python dependencies
│   ├── sql_runner.db           # SQLite database file
│   ├── init_db.sql             # SQL schema and sample data
│   ├── Dockerfile              # Backend Docker image
│   └── venv/                   # Python virtual environment
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Main application component
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css         # Global styles
│   ├── package.json            # Node dependencies
│   ├── tsconfig.json           # TypeScript configuration
│   ├── Dockerfile              # Frontend Docker image
│   └── node_modules/           # Node dependencies
├── docker-compose.yml          # Multi-container orchestration
└── README.md                   # This file
```

## Installation & Setup

### Prerequisites
- **Node.js** (v20+)
- **Python** (v3.10+)
- **npm** or **yarn**
- **Docker** & **Docker Compose** (optional, for containerized setup)

### Step 1: Clone/Create Project Files

All files are already set up in your workspace at `c:\Users\Shaik Abdul Salam\Desktop\sql\`

### Step 2: Backend Setup

Navigate to the backend directory and set up the Python environment:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

**Windows (cmd):**
```bash
venv\Scripts\activate
```

**Windows (PowerShell):**
```bash
.\venv\Scripts\Activate.ps1
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Initialize the database:
```bash
sqlite3 sql_runner.db
.read init_db.sql
.exit
```

### Step 3: Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd ../frontend
npm install
```

### Step 4: Running the Application

#### Local Development

**Terminal 1 - Start Backend:**
```bash
cd backend
venv\Scripts\activate    # Windows
python -m venv venv && venv\Scripts\activate  # Or activate venv
uvicorn main:app --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

Frontend will be available at: `http://localhost:3000`

#### Using Docker Compose

Run both backend and frontend in Docker containers:

```bash
docker-compose up --build
```

Then open:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

To stop services:
```bash
docker-compose down
```

## Usage

### Login

1. Open `http://localhost:3000` in your browser
2. Choose between **Login**, **Register**, or **Forgot Password** tabs

**Default Test Credentials:**
- Username: `admin`
- Password: `admin123`

### Register New User

1. Click on the **Register** tab
2. Enter a new username and password
3. Confirm your password
4. Click **Register**
5. You can now log in with these credentials

### Forgot Password

1. Click on the **Forgot Password** tab
2. Enter your username
3. Enter your new password
4. Confirm your new password
5. Click **Reset Password**
6. You can now log in with your new password

### Execute Queries

1. After logging in, type your SQL query in the query editor
2. Click **Run Query** to execute
3. Results appear in the table below

**Example Queries:**
```sql
SELECT * FROM Customers;
SELECT * FROM Customers WHERE country = 'UK';
SELECT Orders.item, Orders.amount, Customers.first_name FROM Orders JOIN Customers ON Orders.customer_id = Customers.customer_id;
SELECT COUNT(*) FROM Orders;
```

### Explore Tables

1. Click any table name in the left sidebar to view:
   - **Schema**: Column names and data types
   - **Sample Rows**: First 5 rows from the table
2. Click the same table again to collapse the preview

### View Recent Queries

1. Click the **Recent Queries** button in the right sidebar
2. Your last 10 executed queries are displayed
3. Click again to collapse

### View User Profile

1. Click the **Profile** button in the top-right corner
2. View your profile information:
   - Username
   - Member since date
   - Total queries executed
   - Last login time
3. Click **Close** to dismiss the profile dialog

### Logout

Click the **Logout** button in the top-right corner to securely log out

## Sample Database

### Tables

**Customers Table:**
- customer_id (INTEGER, Primary Key)
- first_name (VARCHAR)
- last_name (VARCHAR)
- age (INTEGER)
- country (VARCHAR)

**Orders Table:**
- order_id (INTEGER, Primary Key)
- item (VARCHAR)
- amount (INTEGER)
- customer_id (INTEGER, Foreign Key)

**Shippings Table:**
- shipping_id (INTEGER, Primary Key)
- status (VARCHAR)
- customer (INTEGER)

### Sample Data

**Customers:**
- John Doe, 30, USA
- Robert Luna, 22, USA
- David Robinson, 25, UK
- John Reinhardt, 22, UK
- Betty Doe, 28, UAE

**Orders:**
- Keyboard, 400, customer 4
- Mouse, 300, customer 4
- Monitor, 12000, customer 3
- Keyboard, 400, customer 1
- Mousepad, 250, customer 2

**Shippings:**
- Pending, customer 2
- Pending, customer 4
- Delivered, customer 3
- Pending, customer 5
- Delivered, customer 1

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /token` - Login and get JWT token
- `POST /forgot_password` - Reset password
- `GET /profile` - Get user profile information (requires authentication)

### Queries
- `POST /query` - Execute a SQL query (requires authentication)
- `GET /tables` - Get list of available tables (requires authentication)
- `POST /table_info` - Get schema and sample rows for a table (requires authentication)
- `GET /recent_queries` - Get recent queries for logged-in user (requires authentication)

## Backend Configuration

**Key Files:**
- `main.py` - FastAPI application with all endpoints
- `db.py` - SQLite database connection and query execution utilities
- `sql_runner.db` - SQLite database file (created during setup)

**CORS Settings:**
Frontend at `http://localhost:3000` is whitelisted to communicate with backend

## Frontend Configuration

**Key Files:**
- `app/page.tsx` - Main React component with authentication and SQL runner UI
- `package.json` - Dependencies and build scripts

## Troubleshooting

### Backend Port Already in Use
```bash
# Change port in uvicorn command
uvicorn main:app --host 0.0.0.0 --port 8001
# Update frontend API calls to use :8001
```

### Frontend Module Not Found
```bash
# Reinstall dependencies
cd frontend
npm install
npm run dev
```

### Database Errors
```bash
# Recreate database
rm backend/sql_runner.db
cd backend
sqlite3 sql_runner.db
.read init_db.sql
.exit
```

### CORS Errors
Ensure backend is running on `http://localhost:8000` and frontend on `http://localhost:3000`

## Docker Deployment

### Build Images

```bash
docker-compose build
```

### Run Containers

```bash
docker-compose up -d
```

### View Logs

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Containers

```bash
docker-compose down
```

### Access Services

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

## Performance Considerations

- Query results are limited to prevent large dataset issues
- Table previews show only first 5 rows
- Recent queries store last 10 per user
- User sessions managed via JWT tokens

## Security Notes

- Passwords are hashed using PBKDF2-SHA256
- JWT tokens expire after 60 minutes (configurable in `main.py`)
- CORS restricted to localhost:3000
- SQL queries executed directly (no parameterization in sample; production should use parameterized queries)

## Future Enhancements

- Add query history export
- Implement query builder UI
- Add database schema visualization
- Support for multiple database engines
- Query performance metrics
- Dark mode theme
- Collaborative query sharing
- Query scheduling and automation

## License

This project is created for educational purposes.

## Support

For issues or questions, refer to:
- Backend API Docs: `http://localhost:8000/docs` (FastAPI Swagger)
- Frontend Logs: Check browser console (F12)
- Backend Logs: Terminal output where uvicorn is running

---

**Happy Querying!** 🚀
