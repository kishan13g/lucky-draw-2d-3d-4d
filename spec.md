# Admin User Manager

## Current State
New project, nothing built yet.

## Requested Changes (Diff)

### Add
- Mobile-friendly app with two roles: Admin and User
- Admin panel: view all users, approve/block/remove users
- User dashboard: personal profile view
- Role-based access control so only admin can manage users
- Login/signup flow with role assignment

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Use authorization component for login, roles (admin/user)
2. Backend: user management APIs (list users, update role, block/unblock user)
3. Frontend: Login page, Admin dashboard (user list with controls), User dashboard (profile)
4. Mobile-responsive layout
