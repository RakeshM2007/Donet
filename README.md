# DonationCare - Donation Management System

A modern, responsive, frontend-only **Donation Management System** built with **HTML5, CSS3, and JavaScript** using browser **localStorage** for state persistence.

---

## 🌟 Key Features

### 1. User Roles & Authentication
- **Donor**: Post donations across 10 categories, manage items, review incoming requests, track handovers.
- **Donee**: Search items with live autocomplete suggestions, filter by city/condition/category, view smart donation matches, request items, manage requests.
- **Admin**: System-wide oversight with stats, user moderation (activate/deactivate/delete), donation approval, request management.
- **No hardcoded demo credentials**: Users register first and log in securely.
- **Session management**: Handled entirely via `localStorage`.

### 2. Donation Categories Supported
- 👕 **Clothes**: Type, quantity, size, age group, condition, pickup/delivery.
- 🍚 **Food**: Meal type, quantity, veg/non-veg, prep date, strict expiry check (rejects expired food).
- 💰 **Money**: Financial aid amount, currency, simulated escrow payment status.
- 💊 **Medicine**: Medicine name, type, quantity, strict unexpired check.
- 📚 **Books**, 🧸 **Toys**, 👟 **Shoes**, 🏠 **Household Items**, 🛏️ **Blankets**, 📦 **Other Items**.

### 3. Smart Donation Matching
- While creating a donation request, the system actively checks available contributions in real-time.
- If a match is found (e.g. "10 blankets"), the donee can directly request the existing item.

### 4. Direct Chat System
- Real-time message exchange between Donors and Donees stored in `localStorage`.
- Simulated contextual polite replies after 1.5 seconds for demo testing.
- Sound effects via Web Audio API.

### 5. Notifications & Lifecycle Tracking
- Status lifecycle: **Pending → Requested → Accepted → Completed** (also Cancelled, Rejected).
- Real-time notifications for incoming requests, approvals, completions, and messages.

### 6. Interactive Visual Reports & Charts
- Category breakdown bar chart.
- Donation status progress distribution.
- Most requested and most donated community needs rankings.

### 7. Modern UI / UX
- Responsive design across desktop, tablet, and mobile.
- Dark Mode / Light Mode with persistent toggle.
- Non-intrusive toast notifications and modal windows.

---

## 🚀 How to Run the Project

1. Open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).
2. Register as a **Donor** or **Donee** (Admin account creation is protected by the confidential Admin Passkey).
3. Log in with your registered credentials.
4. Experience the complete end-to-end donation workflow!

---

## 📁 Project Structure

```text
donation-management-system/
│
├── index.html                   # Login page
├── register.html                # Registration page
│
├── donor-dashboard.html         # Donor Dashboard
├── donee-dashboard.html         # Donee Dashboard
├── admin-dashboard.html         # Admin Management Panel
│
├── profile.html                 # User Profile & Password Change
├── donate.html                  # Multi-Category Donation Form
├── donations.html               # Donor's My Donations
├── donation-details.html        # Detailed View & Status Tracker
│
├── search-items.html            # Donee Item Search System
├── available-donations.html     # Available Donations Catalog
├── request-donation.html        # Request Item & Smart Matching
├── requests.html                # Request Coordination Center
├── donation-history.html        # Donation Logs & Export/Print
│
├── chat.html                    # Real-time Chat Simulation
├── notifications.html           # Notifications Center
├── reports.html                 # Visual Charts & Analytics
├── settings.html                # Settings & Dark Mode
│
├── css/
│   └── style.css                # Responsive Modern CSS
│
├── js/
│   └── script.js                # Core Business Logic & LocalStorage
│
└── assets/
    ├── icons/                   # SVG Icons
    └── images/                  # Media Assets
```
