# Invoice Management System

A full-stack invoice management application with **JWT Authentication**, **PDF Export**, and complete invoice management features. Built with Node.js, TypeScript, Express, PostgreSQL, React, and Vite.

## � Key Features

### 🔐 Authentication & Security
- **JWT Authentication** - Secure token-based authentication
- **User Registration & Login** - Complete auth flow
- **Protected Routes** - Frontend and backend route protection
- **Password Hashing** - bcrypt with salt rounds
- **Auth Middleware** - Automatic token validation

### 📄 PDF Export
- **Professional PDF Generation** - Generate branded invoice PDFs
- **Company Header** - Customizable company information
- **Itemized Tables** - Clean line item display
- **Download Feature** - One-click PDF download from UI
- **Direct API Access** - `/api/invoices/:id/pdf` endpoint

### Backend
- RESTful API with Express and TypeScript
- PostgreSQL database with Prisma ORM
- Layered architecture (Router → Controller → Service → Repository)
- **JWT authentication middleware**
- **User management system**
- CRUD operations for Customers and Invoices
- Invoice items management
- **PDF generation service (PDFKit)**
- E2E tests with Jest and Supertest
- Database migrations and seed data

### Frontend
- React with Vite and TypeScript
- Tailwind CSS for styling
- **Login & Registration pages**
- **Protected routes with AuthContext**
- **JWT token management**
- Customer list with search/filter
- Invoice list with filter and sort
- Invoice create/edit form with dynamic line items
- Invoice detail page **with PDF download button**
- Form validation and error handling
- Responsive design

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20.x
- **Language:** TypeScript 5.x
- **Framework:** Express.js 4.x
- **Database:** PostgreSQL 15
- **ORM:** Prisma 5.x
- **Authentication:** JWT (jsonwebtoken) + bcrypt
- **PDF Generation:** PDFKit
- **Testing:** Jest + Supertest

### Frontend
- **Framework:** React 18.x
- **Build Tool:** Vite 5.x
- **Styling:** Tailwind CSS
- **Language:** TypeScript 5.x
- **Routing:** React Router 6.x
- **State Management:** React Context (Auth)

## 📁 Project Structure

```
invoice-management-system/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes (auth, customers, invoices)
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic (auth, invoice, PDF)
│   │   ├── repositories/    # Data access layer (user, customer, invoice)
│   │   ├── middleware/      # JWT authentication middleware
│   │   ├── types/           # TypeScript types & DTOs
│   │   └── app.ts           # Main application
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema (User, Customer, Invoice)
│   │   ├── migrations/      # Database migrations
│   │   └── seed.ts          # Seed data with sample user
│   ├── tests/               # E2E tests
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components (Button, Card, etc.)
│   │   ├── pages/           # Page components (Login, Invoices, etc.)
│   │   ├── context/         # AuthContext for JWT state management
│   │   ├── services/        # API client with auth headers
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Helper functions
│   │   └── App.tsx          # Main app with protected routes
│   └── package.json
├── docker-compose.yml       # PostgreSQL container config
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose**
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/ahmedshablakh/Invoice-Management-System.git
cd invoice-management-system
```

#### 2. Start the Database

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

Verify the database is running:

```bash
docker ps
```

You should see the `invoice-db` container running.

#### 3. Setup Backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Install bcryptjs (for password hashing and verification):
```bash
npm install bcryptjs
```
Generate Prisma client:

```bash
npm run prisma:generate
```

Run database migrations:

```bash
npm run prisma:migrate
```

Seed the database with sample data (creates sample user, customers, and invoices):

```bash
npm run prisma:seed
```

**Sample Login Credentials (created by seed):**
- Email: `admin@example.com`
- Password: `admin123`

Start the backend development server:

```bash
npm run dev
```

The backend API will be available at `http://localhost:3001` (Note: Port 3001, not 3000)

#### 4. Setup Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### 5. Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. **Register a new account** OR **Login with seed credentials:**
   - Email: `admin@example.com`
   - Password: `admin123`
3. You'll be redirected to the home page after successful login
4. All routes are protected - you must be logged in to access them

**Important:** Make sure the backend is running on `http://localhost:3001` before starting the frontend, as the frontend makes API calls to the backend.

## 🧪 Running Tests

### Backend E2E Tests

From the backend directory:

```bash
npm run test:e2e
```

This will run the end-to-end tests that cover:
- Creating a customer
- Creating an invoice for the customer
- Fetching the invoice with details
- Updating invoice status
- Error handling scenarios

## 📡 API Endpoints

### Authentication (Public)

- `POST /api/auth/register` - Register new user
  - Body: `{ email, password, name }`
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`
- `GET /api/auth/me` - Get current user (requires auth token)

### Customers (Protected - Requires JWT Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers (supports search query) |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create a new customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Invoices (Protected - Requires JWT Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | Get all invoices (supports filters) |
| GET | `/api/invoices/:id` | Get invoice by ID with customer and items |
| GET | `/api/invoices/:id/pdf` | **Export invoice as PDF** |
| POST | `/api/invoices` | Create a new invoice with line items |
| PUT | `/api/invoices/:id` | Update invoice |
| DELETE | `/api/invoices/:id` | Delete invoice |

### Authorization Header

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Get the token from the login response and store it in localStorage (handled automatically by the frontend).

### Query Parameters

**Customers:**
- `search` - Search by name, email, or tax number

**Invoices:**
- `search` - Search by invoice number or customer name
- `status` - Filter by status (DRAFT, SENT, PAID, CANCELLED)
- `customerId` - Filter by customer ID
- `sortBy` - Sort field (date, dueDate, totalAmount, etc.)
- `sortOrder` - Sort order (asc, desc)

## 📝 Database Schema

### Users (for Authentication)
```sql
- id (UUID)
- email (String, unique)
- password (String, hashed with bcrypt)
- name (String)
- created_at (DateTime)
- updated_at (DateTime)
```

### Customers
```sql
- id (UUID)
- name (String)
- email (String, unique)
- tax_number (String, optional)
- address (String, optional)
- created_at (DateTime)
- updated_at (DateTime)
```

### Invoices
```sql
- id (UUID)
- customer_id (UUID, foreign key)
- number (String, unique)
- date (DateTime)
- due_date (DateTime)
- status (Enum: DRAFT, SENT, PAID, CANCELLED)
- total_amount (Decimal)
- created_at (DateTime)
- updated_at (DateTime)
```

### Invoice Items
```sql
- id (UUID)
- invoice_id (UUID, foreign key)
- description (String)
- quantity (Integer)
- unit_price (Decimal)
- total (Decimal)
```

## 🎯 Sample Data

After running the seed script, you'll have:
- **1 admin user** (admin@example.com / admin123)
- 3 sample customers
- 4 sample invoices with various statuses
- Multiple invoice items per invoice

## � PDF Export Feature

The application includes a professional PDF invoice generator:

### Features:
- Company header with branding
- Customer billing information
- Itemized line items in a table format
- Total amount calculation
- Invoice metadata (number, dates, status)
- Professional styling with colors

### How to Use:
1. Navigate to any invoice detail page
2. Click the **"📄 Download PDF"** button
3. PDF will download automatically with filename: `invoice-{number}.pdf`

### API Usage:
```bash
GET /api/invoices/:id/pdf
Authorization: Bearer <your-jwt-token>
```

Response: PDF file (application/pdf)

## �🔧 Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://invoice_user:invoice_pass@localhost:5433/invoice_db?schema=public"
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

**Note:** The backend runs on port **3001** (not 3000) and database on port **5433** (not 5432) to avoid conflicts.

## 🛑 Stopping the Application

### Stop Backend
Press `Ctrl + C` in the terminal running the backend

### Stop Frontend
Press `Ctrl + C` in the terminal running the frontend

### Stop Database
```bash
docker-compose down
```

To stop and remove volumes (deletes all data):
```bash
docker-compose down -v
```

## 🐛 Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Ensure Docker is running
2. Check if PostgreSQL container is running: `docker ps`
3. Restart the container: `docker-compose restart`
4. Check logs: `docker-compose logs postgres`

### Port Already in Use

If port 3000 or 5173 is already in use:

- Backend: Change `PORT` in `.env` file
- Frontend: Change port in `vite.config.ts`
- Database: Change port mapping in `docker-compose.yml`

### Prisma Migration Issues

If migrations fail:

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migrations again
npm run prisma:migrate
npm run prisma:seed
```

## 📚 Development Commands

### Backend

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database
npm run test:e2e         # Run E2E tests
```

### Frontend

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
```

## 🎨 UI Features

- ✅ Responsive design for mobile and desktop
- ✅ Search and filter functionality
- ✅ Sort invoices by date, amount, status
- ✅ Dynamic invoice line items (add/remove)
- ✅ Form validation with error messages
- ✅ Success/error toast notifications
- ✅ Loading states
- ✅ Clean and modern UI with Tailwind CSS

## 📄 License

This project is created for educational purposes.

## 👨‍💻 Author

Built with ❤️ using Node.js, TypeScript, React, and PostgreSQL
