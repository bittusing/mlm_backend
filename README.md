# MLM Backend API

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create .env file:
```bash
cp .env.example .env
```

3. Update .env with your MongoDB URI and JWT secret

4. Start server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### User Routes
- GET /api/users/dashboard - User dashboard stats
- GET /api/users/profile - Get profile
- PUT /api/users/profile - Update profile
- GET /api/users/transactions - Transaction history
- GET /api/users/income - Income breakdown
- POST /api/users/withdrawals - Create withdrawal
- GET /api/users/withdrawals - Get withdrawals
- GET /api/users/team/direct - Direct referrals
- GET /api/users/team/tree - Team tree
- GET /api/users/team/levels - Level wise team

### Plans
- GET /api/plans - Get all plans
- POST /api/plans/purchase - Purchase plan
- GET /api/plans/my-plans - Get user plans

### Admin Routes
- GET /api/admin/dashboard - Admin dashboard
- GET /api/admin/users - All users
- GET /api/admin/users/:id - User details
- PUT /api/admin/users/:id/block - Block user
- PUT /api/admin/users/:id/unblock - Unblock user
- GET /api/admin/users/:id/tree - User tree
- POST /api/admin/plans - Create plan
- PUT /api/admin/plans/:id - Update plan
- DELETE /api/admin/plans/:id - Delete plan
- GET /api/admin/withdrawals - All withdrawals
- PUT /api/admin/withdrawals/:id/approve - Approve withdrawal
- PUT /api/admin/withdrawals/:id/reject - Reject withdrawal
- GET /api/admin/reports/* - Various reports

### Commission Settings
- GET /api/commission/settings - Get settings
- PUT /api/commission/settings - Update settings
