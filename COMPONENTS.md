# Component Documentation

## Component Hierarchy

```
App.js (Main Application)
├── DashboardView
│   └── TimelineView
└── ManagementView
    ├── ClientsPanel
    ├── ResourcesPanel
    └── AssignmentsPanel
```

---

## Core Components

### App.js
**Location:** `src/App.js`

**Purpose:** Main application component that manages global state and routing between Dashboard and Management views.

**State Management:**
- `resources` - Array of all resources from database
- `clients` - Array of all clients from database
- `milestones` - Array of all milestones from database
- `allocations` - Array of all allocations from database
- `currentView` - 'dashboard' or 'management'
- Filter states: `selectedClient`, `selectedResourceType`, `selectedResource`, `selectedMilestone`, `selectedYear`

**Key Functions:**
- `loadData()` - Fetches all data from API using `fetchAllData()` from api.js
- `filteredAllocations` - Memoized computed value based on filter selections
- `groupedAllocations` - Organizes allocations by resource type and resource for timeline display

**Props Passed Down:**
- To DashboardView: All state, filters, grouped allocations, handlers
- To ManagementView: All data arrays, `refreshData` function

**Responsibilities:**
- Initial data loading
- Global state management
- View routing
- Filter state management
- Data transformation for child components

---

## Dashboard Components

### DashboardView
**Location:** `src/components/DashboardView.js`

**Purpose:** Container for the dashboard view with filters and timeline.

**Props Received:**
- Filter values and handlers
- Available options for each filter (computed in App.js)
- `groupedAllocations` - Pre-processed allocation data
- `refreshData` - Function to reload data

**Structure:**
- Header with title and refresh button
- Collapsible filter panel with 5 filters:
  - Client dropdown
  - Resource Type dropdown
  - Resource dropdown
  - Milestone dropdown
  - Year dropdown
- Timeline container

**Responsibilities:**
- Render filter UI
- Pass grouped allocations to TimelineView
- Handle filter UI interactions

---

### TimelineView
**Location:** `src/components/TimelineView.js`

**Purpose:** Renders a Gantt-style timeline showing resource allocations across the year.

**Props Received:**
- `groupedAllocations` - Object organized by resource type → resource ID → allocations array
- `selectedYear` - Currently selected year for timeline

**Key Features:**
- Displays 365 days horizontally
- Groups by resource type (sections)
- Groups by individual resource (rows)
- Automatically calculates "lanes" to prevent overlapping allocations
- Color-codes by client
- Shows allocation details on hover

**Internal Functions:**
- `calculateLanes(allocations)` - Determines vertical positioning to avoid overlaps
- `getMilestonePosition(allocation)` - Calculates left position and width based on dates
- `yearDays` - Generates array of 365 dates for the selected year
- `clientColors` - Memoized mapping of client IDs to colors

**Rendering Logic:**
```
For each Resource Type:
  For each Resource of that type:
    Calculate lanes needed (vertical stacking)
    For each lane:
      Render allocations that don't overlap
```

**Responsibilities:**
- Visual timeline rendering
- Overlap detection and resolution
- Date-to-pixel calculations
- Tooltip information

---

## Management Components

### ManagementView
**Location:** `src/components/ManagementView.js`

**Purpose:** Container for management functionality with tab navigation.

**Props Received:**
- `clients`, `resources`, `milestones`, `allocations` - All data arrays
- `refreshData` - Function to reload all data after changes

**State:**
- `activeTab` - 'clients', 'resources', or 'assignments'

**Structure:**
- Header
- Tab navigation (3 tabs)
- Tab content area that renders the appropriate panel

**Responsibilities:**
- Tab state management
- Route props to appropriate panel
- Provide consistent layout for management functions

---

### ClientsPanel
**Location:** `src/components/ClientsPanel.js`

**Purpose:** Full CRUD operations for Clients and their Milestones.

**Props Received:**
- `clients` - Array of client objects
- `milestones` - Array of milestone objects
- `refreshData` - Function to reload data after changes

**State:**
- `editingClient` - ID of client currently being edited
- `localClients` - Local copy for optimistic updates
- `localMilestones` - Local copy for optimistic updates
- `saving` - Boolean to disable UI during save operations

**Features:**

**Client Operations:**
- ➕ Add new client
- ✏️ Edit client (name, type, year)
- 💾 Save client (calls API)
- 🗑️ Delete client (with confirmation)

**Milestone Operations:**
- ➕ Add milestone to client
- ✏️ Edit milestone (name, dates) - auto-saves on blur
- 🗑️ Delete milestone (with confirmation)

**API Calls Used:**
- `saveClient(client, isNew)` - POST or PUT
- `deleteClient(clientId)` - DELETE
- `saveMilestone(milestone, isNew)` - POST or PUT
- `deleteMilestone(milestoneId)` - DELETE

**Responsibilities:**
- Client CRUD UI
- Milestone CRUD UI (nested under clients)
- Form validation
- Error handling with user feedback
- Optimistic UI updates

---

### ResourcesPanel
**Location:** `src/components/ResourcesPanel.js`

**Purpose:** Full CRUD operations for Resources and their Types.

**Props Received:**
- `resources` - Array of resource objects
- `refreshData` - Function to reload data after changes

**State:**
- `editingResource` - ID of resource currently being edited
- `localResources` - Local copy for optimistic updates
- `saving` - Boolean to disable UI during save operations

**Features:**

**Resource Operations:**
- ➕ Add new resource
- ✏️ Edit resource (name, types via checkboxes)
- 💾 Save resource (calls API)
- 🗑️ Delete resource (with confirmation)

**Resource Type Management:**
- Multiple types can be assigned to one resource
- Checkbox interface for selecting types
- Validation: At least one type must be selected

**API Calls Used:**
- `saveResource(resource, isNew)` - POST or PUT
- `deleteResource(resourceId)` - DELETE

**Responsibilities:**
- Resource CRUD UI
- Resource type selection (checkboxes)
- Form validation (name required, at least one type)
- Error handling with user feedback

---

### AssignmentsPanel
**Location:** `src/components/AssignmentsPanel.js`

**Purpose:** Assign resources to clients for all their milestones (bulk assignment).

**Props Received:**
- `clients` - Array of client objects
- `resources` - Array of resource objects
- `allocations` - Array of current allocations
- `refreshData` - Function to reload data after changes

**State:**
- `saving` - Boolean to disable UI during save operations

**Features:**
- For each client, shows 5 dropdowns (one per resource type)
- Each dropdown shows only resources that have that type
- Selecting a resource assigns them to ALL milestones for that client
- Uses batch API endpoint for efficiency

**Key Function:**
- `getClientAssignments(clientId)` - Returns current resource assignments by type
- `handleAssignResource(clientId, resourceType, resourceId)` - Calls batch API

**API Calls Used:**
- `updateClientAllocations(clientId, resourceType, resourceId)` - POST to /allocations/batch

**How Batch Assignment Works:**
1. User selects resource for a type
2. API deletes old allocations for that client/type
3. API creates new allocations for ALL milestones of that client
4. Frontend refreshes to show updates

**Responsibilities:**
- Display current assignments
- Handle resource assignment changes
- Call batch update API
- Show loading state during operations

---

## Supporting Files

### constants.js
**Location:** `src/constants/constants.js`

**Exports:**
- `RESOURCE_TYPES` - Array of 5 programmer types
- `MILESTONE_TYPES` - Array of 15 milestone names
- `API_BASE_URL` - Base URL for API (localhost or production)

**Purpose:** Single source of truth for constant values used throughout the app.

---

### api.js
**Location:** `src/services/api.js`

**Purpose:** Abstraction layer for all API calls. Single place to update endpoints.

**Exports:**

**Data Fetching:**
- `fetchAllData()` - GET all tables, returns transformed data object

**Client APIs:**
- `saveClient(client, isNew)` - POST/PUT
- `deleteClient(clientId)` - DELETE

**Resource APIs:**
- `saveResource(resource, isNew)` - POST/PUT
- `deleteResource(resourceId)` - DELETE

**Milestone APIs:**
- `saveMilestone(milestone, isNew)` - POST/PUT
- `deleteMilestone(milestoneId)` - DELETE

**Allocation APIs:**
- `saveAllocation(allocation, isNew)` - POST/PUT
- `deleteAllocation(allocationId)` - DELETE
- `updateClientAllocations(clientId, resourceType, resourceId)` - POST batch

**Error Handling:**
- All functions throw errors with descriptive messages
- Components handle errors and show user alerts

---

## Data Flow Patterns

### Read Operations (Dashboard)
```
User opens app
  ↓
App.js useEffect triggers
  ↓
loadData() called
  ↓
api.fetchAllData() → Azure Functions → SQL Database
  ↓
Data transformed and stored in state
  ↓
State passed to DashboardView
  ↓
DashboardView passes groupedAllocations to TimelineView
  ↓
TimelineView renders visual timeline
```

### Write Operations (Management)
```
User clicks Save in ClientsPanel
  ↓
handleSaveClient() called
  ↓
api.saveClient() → Azure Function → SQL Database
  ↓
On success: refreshData() called
  ↓
App.js re-fetches all data
  ↓
UI updates with fresh data
```

### Batch Assignment (Assignments)
```
User selects resource from dropdown
  ↓
handleAssignResource() called
  ↓
api.updateClientAllocations() → Azure Function
  ↓
Function deletes old allocations for that client/type
  ↓
Function creates new allocations for ALL milestones
  ↓
Success → refreshData()
  ↓
UI shows new assignments
```

---

## State Management Philosophy

**Why lift state to App.js?**
- Single source of truth for all data
- Dashboard and Management views share the same data
- One `refreshData()` function updates everything
- Avoids prop drilling by passing only what's needed

**Local State in Panels:**
- Used for UI state (editing, saving)
- Used for optimistic updates before API confirmation
- Keeps App.js clean and focused on global state

---

## Styling Notes

All components use classes defined in `App.css`:
- `.dashboard`, `.management-container` - Main containers
- `.filters-container`, `.filter-group` - Filter UI
- `.timeline`, `.timeline-header`, `.timeline-body` - Timeline structure
- `.item-card`, `.edit-form` - Management panel cards
- `.icon-btn`, `.add-btn`, `.save-btn` - Buttons
- `.milestone-item`, `.type-badges` - List items

Icons from `lucide-react` library.

---

## Testing Considerations

**Key User Flows to Test:**

1. **Dashboard View:**
   - Load data successfully
   - Apply filters and see timeline update
   - Hover over allocations to see details
   - Switch years

2. **Client Management:**
   - Add new client
   - Edit client details
   - Add milestone to client
   - Edit milestone dates
   - Delete milestone
   - Delete client (cascade deletes milestones and allocations)

3. **Resource Management:**
   - Add new resource
   - Assign multiple types to resource
   - Edit resource name/types
   - Delete resource

4. **Assignments:**
   - Assign resource to client
   - Change assignment (replaces old allocation)
   - Verify all milestones get allocated

**Edge Cases:**
- Deleting client with many allocations
- Resource with no types selected (should prevent save)
- Overlapping allocations on timeline
- Empty states (no data)
- API errors (should show user-friendly messages)

---

## Future Enhancement Ideas

1. **Export Features:**
   - Export timeline as image
   - Export data as Excel
   - PDF reports

2. **Advanced Filters:**
   - Date range filter
   - Multi-select filters
   - Save filter presets

3. **Resource Utilization:**
   - Show resource workload percentage
   - Highlight over-allocated resources
   - Capacity planning tools

4. **Drag and Drop:**
   - Drag allocations on timeline to change dates
   - Drag resources between assignments

5. **Notifications:**
   - Alert when resources are double-booked
   - Remind of upcoming milestones

6. **Permissions:**
   - Read-only vs. edit users
   - Client-specific access

7. **Audit Log:**
   - Track who changed what and when
   - History of allocations