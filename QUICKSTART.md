# Resource Allocation Dashboard - Quick Start Guide

## 🚀 Run Locally

### Prerequisites
- Node.js 18.x
- Azure Functions Core Tools v4
- Azure SQL Database with connection string

### Start the Application

1. **Start Azure Functions API** (in one terminal)
```bash
cd api
npm install
func start
```
API will run on: `http://localhost:7071`

2. **Start React Frontend** (in another terminal)
```bash
npm install
npm start
```
Frontend will run on: `http://localhost:3000`

### Configuration

**API Configuration:**
- File: `api/local.settings.json` (not in git - see `.gitignore`)
- Add your Azure SQL connection string to `SQL_CONNECTION_STRING`

**Frontend Configuration:**
- Default API URL: `http://localhost:7071/api`
- Override with environment variable: `REACT_APP_API_URL`

---

## 📁 Project Structure

```
resourceallocationdashboard-live/
├── src/                          # React Frontend
│   ├── App.js                    # Main application component
│   ├── App.css                   # Global styles
│   ├── constants/
│   │   └── constants.js          # RESOURCE_TYPES, MILESTONE_TYPES, API_BASE_URL
│   ├── services/
│   │   └── api.js                # All API calls (fetch functions)
│   └── components/
│       ├── DashboardView.js      # Dashboard with filters
│       ├── TimelineView.js       # Gantt-style timeline visualization
│       ├── ManagementView.js     # Management tab container
│       ├── ClientsPanel.js       # Client & milestone CRUD
│       ├── ResourcesPanel.js     # Resource & type CRUD
│       └── AssignmentsPanel.js   # Assign resources to clients
├── api/                          # Azure Functions Backend
│   ├── package.json
│   ├── host.json
│   ├── local.settings.json       # Local config (gitignored)
│   ├── GetClients/
│   │   ├── function.json
│   │   └── index.js
│   ├── GetResources/
│   ├── GetMilestones/
│   ├── GetAllocations/
│   ├── SaveClient/               # POST/PUT client
│   ├── DeleteClient/             # DELETE client
│   ├── SaveResource/             # POST/PUT resource
│   ├── DeleteResource/           # DELETE resource
│   ├── SaveMilestone/            # POST/PUT milestone
│   ├── DeleteMilestone/          # DELETE milestone
│   ├── SaveAllocation/           # POST/PUT allocation
│   ├── DeleteAllocation/         # DELETE allocation
│   └── UpdateClientAllocations/  # Batch update allocations
├── public/
└── package.json
```

---

## 🔧 Common Development Tasks

### Add a New API Endpoint

1. Create new folder in `api/`:
```bash
mkdir api/MyNewFunction
```

2. Create `api/MyNewFunction/function.json`:
```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get"],
      "route": "myroute"
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

3. Create `api/MyNewFunction/index.js`:
```javascript
const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        // Your SQL query here
        context.res = {
            status: 200,
            body: { success: true }
        };
    } catch (err) {
        context.log('Error:', err);
        context.res = {
            status: 500,
            body: { error: err.message }
        };
    }
};
```

4. Restart Azure Functions

### Add a New React Component

1. Create file in `src/components/`:
```javascript
import React from 'react';

const MyComponent = ({ prop1, prop2 }) => {
    return (
        <div>
            {/* Your JSX */}
        </div>
    );
};

export default MyComponent;
```

2. Import and use in parent component

### Add a New API Call

1. Edit `src/services/api.js`:
```javascript
export const myNewApiCall = async (data) => {
    const response = await fetch(`${API_BASE_URL}/myroute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed');
    return response.json();
};
```

2. Import and use in components:
```javascript
import { myNewApiCall } from '../services/api';

// In your component
const handleAction = async () => {
    const result = await myNewApiCall(data);
};
```

### Update Database Schema

1. Update Azure SQL database directly (Azure Portal or SSMS)
2. Update `DATABASE.md` documentation
3. Update API functions if needed
4. Update React components if needed

---

## 🎯 Key Technologies

- **Frontend:** React 18, Lucide Icons
- **Backend:** Azure Functions (Node.js v3 model), mssql npm package
- **Database:** Azure SQL Server
- **Deployment:** Azure Static Web Apps (planned)

---

## 📝 Data Flow

```
User Action
    ↓
React Component
    ↓
API Service (src/services/api.js)
    ↓
Azure Function (api/[FunctionName]/)
    ↓
Azure SQL Database
    ↓
Response back through chain
```

---

## 🐛 Troubleshooting

### API not starting
- Check Node.js version: `node --version` (should be 18.x)
- Check Azure Functions Core Tools: `func --version`
- Verify `api/local.settings.json` exists with connection string

### Database connection errors
- Verify connection string in `local.settings.json`
- Check Azure SQL firewall rules (allow your IP)
- Test connection with Azure Data Studio or SSMS

### React app not connecting to API
- Verify API is running on `http://localhost:7071`
- Check browser console for CORS errors
- Verify `API_BASE_URL` in constants.js

---

## 📚 Additional Documentation

- `DATABASE.md` - Complete database schema
- `COMPONENTS.md` - Component hierarchy and responsibilities
- `README.md` - Project overview

---

## 🔐 Security Notes

- Never commit `local.settings.json` to git
- Use Azure Application Settings for production secrets
- Connection strings should only be in environment variables
- `authLevel: "anonymous"` is for development - change for production