# GoalArc - Personal Finance Manager

A modern personal finance web application with goal-based savings system, AI-powered suggestions, and comprehensive financial analysis.

![GoalArc](https://img.shields.io/badge/GoalArc-Finance%20Manager-8B5CF6?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.0-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)

## ✨ Features

### 🎯 Goal-Based Savings System
- Create multiple financial goals with target amounts and timelines
- Track progress with visual progress bars and percentage indicators
- Add funds to goals with dedicated modal interface
- Delete goals when no longer needed
- Automatic completion detection when target is reached

### 🤖 AI-Powered Financial Advisor
Our custom AI engine analyzes your spending patterns and provides personalized suggestions:

```javascript
// Example AI Suggestions:
💡 "You spent ₹1,000 more on Clothing this month (25% increase). Reducing this could help you reach 'Car' goal faster!"
📊 "Your top expense is Food at ₹5,000/month. Cut 20% to save ₹1,000/month × 6 months = ₹6,000 towards 'Vacation'!"
⚠️ "Your savings rate is 15%. Try the 50/30/20 rule - save ₹10,000/month to reach your goal."
☕ "Skip one small expense daily! Just ₹100/day = ₹3,000/month."
```

### 📊 Financial Dashboard
- **Income Tracking**: Monitor monthly income with green indicators
- **Expense Tracking**: Track monthly expenses with red indicators
- **Balance Display**: Real-time balance calculation
- **Visual Charts**: Bar chart showing income vs expense trends

### 💳 Transaction Management
- Add income and expense transactions
- Categorize transactions (Food, Shopping, Transport, Entertainment, Bills, Salary, etc.)
- Edit existing transactions
- Delete transactions
- Click to expand transaction details
- Full transaction history in Reports section

### ⚙️ Settings & Profile
- Edit profile (name and phone number)
- Email display (non-editable - used for login)
- SMS notification toggle
- Email notification toggle
- Clear all data option

### 🔐 Secure Authentication
- Google OAuth 2.0 integration
- Secure session management
- User-specific data isolation
- LocalStorage persistence per user

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework |
| **React Router** | Navigation |
| **Lucide React** | Icon Library |
| **CSS-in-JS** | Inline Styling with Glassmorphism |
| **Google OAuth** | Authentication |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime Environment |
| **Express.js** | Web Framework |
| **MongoDB** | NoSQL Database |
| **Mongoose** | MongoDB ODM |
| **google-auth-library** | OAuth Verification |

### Design
- **Purple Gradient Theme**: `#8B5CF6`, `#7C3AED`, `#6D28D9`
- **Glassmorphism Effects**: Backdrop blur, transparency
- **Dark Mode First**: Professional dark UI
- **Responsive Design**: Works on all screen sizes

## 📁 Project Structure

```
goalArc/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Dashboard.js      # Main dashboard (1900+ lines)
│   │   ├── pages/
│   │   │   ├── LandingPage.js    # Landing page
│   │   │   ├── Auth.js           # Authentication
│   │   │   └── Dashboard.js      # Legacy dashboard
│   │   ├── App.js                # Routes & Google OAuth
│   │   └── index.js              # Entry point
│   └── package.json
├── backend/
│   ├── models/
│   │   └── User.js               # User schema
│   ├── server.js                 # Express server & routes
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- Google Cloud Console project with OAuth credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd goalArc
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   echo "MONGODB_URI=mongodb://localhost:27017/goalarc" > .env
   echo "PORT=5000" >> .env
   
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000` to authorized origins
   - Update client ID in `App.js`

### Development URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 💡 AI Engine Architecture

The custom AI suggestion engine analyzes financial data using rule-based intelligence:

```javascript
const getAISuggestion = (goal) => {
  const analysis = getSpendingAnalysis();
  
  // 1. Compare current vs last month spending by category
  // 2. Identify categories with increased spending
  // 3. Calculate potential savings from reducing expenses
  // 4. Suggest actionable strategies based on goal timeline
  
  return personalizedSuggestion;
};

const getSpendingAnalysis = () => {
  // Group transactions by category
  // Compare month-over-month spending
  // Calculate savings rate
  // Identify top expense categories
  
  return { increasedSpending, topCategories, savingsRate };
};
```

### AI Suggestion Types:
1. **Spending Increase Alert**: Notifies when category spending increases
2. **Top Expense Analysis**: Suggests percentage cuts on highest expenses
3. **Savings Rate Warning**: Recommends 50/30/20 budgeting rule
4. **Daily Challenge**: Small daily savings suggestions
5. **Progress Motivation**: Encouragement based on goal progress

## 📱 Key Screens

### Landing Page
- Hero section with app introduction
- Feature highlights
- Demo goal card preview
- Call-to-action buttons

### Dashboard
- Stat cards (Income, Expense, Goals Progress)
- Balance indicator
- Recent transactions (expandable)
- Quick action buttons

### Goal Setter
- Goal cards with progress visualization
- AI suggestions per goal
- Add funds modal
- Delete goal option

### Analysis
- Income vs Expense bar chart
- Transaction summary totals
- Category breakdown

### Reports
- All transactions list
- Expandable transaction details
- Amount, category, date display

### Settings
- Profile editing
- Notification toggles
- Data management

## 🔒 Security Features

- JWT-based session management
- Google OAuth 2.0 authentication
- User-specific data isolation (`goalArc_${email}`)
- No sensitive data in frontend code
- Protected API endpoints

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Purple | `#8B5CF6` | Buttons, accents |
| Dark Purple | `#7C3AED` | Gradients |
| Deep Purple | `#6D28D9` | Hover states |
| Background | `#1e1b4b` | Main background |
| Success Green | `#22c55e` | Income, completed |
| Error Red | `#ef4444` | Expenses, warnings |
| Light Purple | `#a78bfa` | Text highlights |

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Built with ❤️ using React, Node.js, and MongoDB**