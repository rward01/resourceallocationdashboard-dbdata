import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, Briefcase, CheckSquare, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const RESOURCE_TYPES = [
     'FCI Programmer',
     'ABC Programmer',
     'GHI Programmer',
     'JKL Programmer',
     'MNO Programmer'
];

const MILESTONE_TYPES = [
     'Mapping Slice Due',
     'Mapping Sessions',
     '1st Cut Slice Due',
     '1st Cut Internal Delivery',
     '1st Cut Support',
     '2nd Cut Slice Due',
     '2nd Cut Internal Delivery',
     '2nd Cut Support',
     '3rd Cut Slice Due',
     '3rd Cut Internal Delivery',
     '3rd Cut Support',
     'Mock Slice Due',
     'Mock 1',
     'Mock 2',
     'Go-Live'
];

// API Base URL - will use relative URLs when deployed to Azure
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7071/api';

const ResourceAllocationDashboard = () => {
     const [currentView, setCurrentView] = useState('dashboard');
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState(null);

     // State for data from API
     const [resources, setResources] = useState([]);
     const [clients, setClients] = useState([]);
     const [milestones, setMilestones] = useState([]);
     const [allocations, setAllocations] = useState([]);

     // Fetch data from API on mount
     useEffect(() => {
          fetchAllData();
     }, []);

     const fetchAllData = async () => {
          setLoading(true);
          setError(null);
          
          try {
               const [clientsRes, resourcesRes, milestonesRes, allocationsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/clients`),
                    fetch(`${API_BASE_URL}/resources`),
                    fetch(`${API_BASE_URL}/milestones`),
                    fetch(`${API_BASE_URL}/allocations`)
               ]);

               if (!clientsRes.ok || !resourcesRes.ok || !milestonesRes.ok || !allocationsRes.ok) {
                    throw new Error('Failed to fetch data from API');
               }

               const [clientsData, resourcesData, milestonesData, allocationsData] = await Promise.all([
                    clientsRes.json(),
                    resourcesRes.json(),
                    milestonesRes.json(),
                    allocationsRes.json()
               ]);

               // Transform data to match expected format
               setClients(clientsData.map(c => ({
                    id: c.ClientId,
                    name: c.ClientName,
                    type: c.ClientType,
                    year: c.Year
               })));

               setResources(resourcesData);

               setMilestones(milestonesData.map(m => ({
                    ...m,
                    startDate: new Date(m.startDate),
                    endDate: new Date(m.endDate)
               })));

               setAllocations(allocationsData.map(a => ({
                    ...a,
                    startDate: new Date(a.startDate),
                    endDate: new Date(a.endDate)
               })));

               setLoading(false);
          } catch (err) {
               console.error('Error fetching data:', err);
               setError(err.message);
               setLoading(false);
          }
     };

     const [selectedClient, setSelectedClient] = useState('all');
     const [selectedResourceType, setSelectedResourceType] = useState('all');
     const [selectedResource, setSelectedResource] = useState('all');
     const [selectedMilestone, setSelectedMilestone] = useState('all');
     const [selectedYear, setSelectedYear] = useState(2025);
     const [filtersExpanded, setFiltersExpanded] = useState(true);

     const filteredAllocations = useMemo(() => {
          return allocations.filter(allocation => {
               if (selectedClient !== 'all' && allocation.clientId !== selectedClient) {
                    return false;
               }

               if (selectedResourceType !== 'all') {
                    const resource = resources.find(r => r.id === allocation.resourceId);
                    if (!resource || !resource.types.includes(selectedResourceType)) {
                         return false;
                    }
               }

               if (selectedResource !== 'all' && allocation.resourceId !== selectedResource) {
                    return false;
               }

               if (selectedMilestone !== 'all' && allocation.milestoneName !== selectedMilestone) {
                    return false;
               }

               if (allocation.startDate.getFullYear() !== selectedYear &&
                    allocation.endDate.getFullYear() !== selectedYear) {
                    return false;
               }

               return true;
          });
     }, [allocations, selectedClient, selectedResourceType, selectedResource, selectedMilestone, selectedYear, resources]);

     const availableClients = useMemo(() => {
          const clientIds = new Set(filteredAllocations.map(a => a.clientId));
          return clients.filter(c => clientIds.has(c.id));
     }, [filteredAllocations, clients]);

     const availableResourceTypes = useMemo(() => {
          const types = new Set();
          filteredAllocations.forEach(allocation => {
               const resource = resources.find(r => r.id === allocation.resourceId);
               if (resource) {
                    resource.types.forEach(type => types.add(type));
               }
          });
          return Array.from(types).sort();
     }, [filteredAllocations, resources]);

     const availableResources = useMemo(() => {
          const resourceIds = new Set(filteredAllocations.map(a => a.resourceId));
          return resources.filter(r => resourceIds.has(r.id));
     }, [filteredAllocations, resources]);

     const availableMilestones = useMemo(() => {
          const milestoneNames = new Set(filteredAllocations.map(a => a.milestoneName));
          return MILESTONE_TYPES.filter(m => milestoneNames.has(m));
     }, [filteredAllocations]);

     const groupedAllocations = useMemo(() => {
          const grouped = {};

          filteredAllocations.forEach(allocation => {
               const resource = resources.find(r => r.id === allocation.resourceId);
               if (!resource) return;

               resource.types.forEach(type => {
                    if (!grouped[type]) {
                         grouped[type] = {};
                    }

                    if (!grouped[type][resource.id]) {
                         grouped[type][resource.id] = {
                              resourceName: resource.name,
                              allocations: []
                         };
                    }

                    grouped[type][resource.id].allocations.push(allocation);
               });
          });

          return grouped;
     }, [filteredAllocations, resources]);

     const handleClientChange = (e) => {
          setSelectedClient(e.target.value);
     };

     const handleResourceTypeChange = (e) => {
          setSelectedResourceType(e.target.value);
     };

     const handleResourceChange = (e) => {
          setSelectedResource(e.target.value);
     };

     const handleMilestoneChange = (e) => {
          setSelectedMilestone(e.target.value);
     };

     const handleYearChange = (e) => {
          setSelectedYear(parseInt(e.target.value));
     };

     const toggleFilters = () => {
          setFiltersExpanded(!filtersExpanded);
     };

     const refreshData = () => {
          fetchAllData();
     };

     if (loading) {
          return (
               <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    fontSize: '18px',
                    color: '#666'
               }}>
                    Loading data from database...
               </div>
          );
     }

     if (error) {
          return (
               <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    fontSize: '18px',
                    color: '#ef4444'
               }}>
                    <p>Error loading data: {error}</p>
                    <button 
                         onClick={refreshData}
                         style={{
                              marginTop: '20px',
                              padding: '10px 20px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer'
                         }}
                    >
                         Retry
                    </button>
               </div>
          );
     }

     return (
          <div className="app-container">
               <nav className="main-nav">
                    <div className="nav-brand">Resource Allocation System</div>
                    <div className="nav-buttons">
                         <button
                              className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
                              onClick={() => setCurrentView('dashboard')}
                         >
                              📊 Dashboard
                         </button>
                         <button
                              className={`nav-btn ${currentView === 'management' ? 'active' : ''}`}
                              onClick={() => setCurrentView('management')}
                         >
                              ⚙️ Management
                         </button>
                    </div>
               </nav>

               {currentView === 'dashboard' ? (
                    <DashboardView
                         clients={clients}
                         resources={resources}
                         milestones={milestones}
                         allocations={allocations}
                         availableClients={availableClients}
                         availableResourceTypes={availableResourceTypes}
                         availableResources={availableResources}
                         availableMilestones={availableMilestones}
                         groupedAllocations={groupedAllocations}
                         selectedClient={selectedClient}
                         selectedResourceType={selectedResourceType}
                         selectedResource={selectedResource}
                         selectedMilestone={selectedMilestone}
                         selectedYear={selectedYear}
                         filtersExpanded={filtersExpanded}
                         handleClientChange={handleClientChange}
                         handleResourceTypeChange={handleResourceTypeChange}
                         handleResourceChange={handleResourceChange}
                         handleMilestoneChange={handleMilestoneChange}
                         handleYearChange={handleYearChange}
                         toggleFilters={toggleFilters}
                         refreshData={refreshData}
                    />
               ) : (
                    <ManagementView 
                         clients={clients}
                         resources={resources}
                         milestones={milestones}
                         allocations={allocations}
                         refreshData={refreshData}
                    />
               )}
          </div>
     );
};

const DashboardView = ({
     availableClients,
     availableResourceTypes,
     availableResources,
     availableMilestones,
     groupedAllocations,
     selectedClient,
     selectedResourceType,
     selectedResource,
     selectedMilestone,
     selectedYear,
     filtersExpanded,
     handleClientChange,
     handleResourceTypeChange,
     handleResourceChange,
     handleMilestoneChange,
     handleYearChange,
     toggleFilters,
     refreshData
}) => {
     return (
          <div className="dashboard">
               <header className="dashboard-header">
                    <div className="header-content">
                         <h1>Resource Allocation Dashboard</h1>
                         <div className="data-controls">
                              <button className="data-button save" onClick={refreshData} title="Refresh data from database">
                                   🔄 Refresh Data
                              </button>
                         </div>
                    </div>
               </header>

               <div className="filters-wrapper">
                    <button className="filters-toggle" onClick={toggleFilters}>
                         {filtersExpanded ? '▼' : '▶'} Filters
                    </button>
                    {filtersExpanded && (
                         <div className="filters-container">
                              <div className="filter-group">
                                   <label>
                                        <Briefcase size={16} />
                                        <span>Client</span>
                                   </label>
                                   <select value={selectedClient} onChange={handleClientChange}>
                                        <option value="all">All Clients</option>
                                        {availableClients.map(client => (
                                             <option key={client.id} value={client.id}>
                                                  {client.name} ({client.type})
                                             </option>
                                        ))}
                                   </select>
                              </div>

                              <div className="filter-group">
                                   <label>
                                        <Users size={16} />
                                        <span>Resource Type</span>
                                   </label>
                                   <select value={selectedResourceType} onChange={handleResourceTypeChange}>
                                        <option value="all">All Resource Types</option>
                                        {availableResourceTypes.map(type => (
                                             <option key={type} value={type}>{type}</option>
                                        ))}
                                   </select>
                              </div>

                              <div className="filter-group">
                                   <label>
                                        <Users size={16} />
                                        <span>Resource</span>
                                   </label>
                                   <select value={selectedResource} onChange={handleResourceChange}>
                                        <option value="all">All Resources</option>
                                        {availableResources.map(resource => (
                                             <option key={resource.id} value={resource.id}>
                                                  {resource.name}
                                             </option>
                                        ))}
                                   </select>
                              </div>

                              <div className="filter-group">
                                   <label>
                                        <CheckSquare size={16} />
                                        <span>Milestone</span>
                                   </label>
                                   <select value={selectedMilestone} onChange={handleMilestoneChange}>
                                        <option value="all">All Milestones</option>
                                        {availableMilestones.map(milestone => (
                                             <option key={milestone} value={milestone}>{milestone}</option>
                                        ))}
                                   </select>
                              </div>

                              <div className="filter-group">
                                   <label>
                                        <Calendar size={16} />
                                        <span>Year</span>
                                   </label>
                                   <select value={selectedYear} onChange={handleYearChange}>
                                        <option value={2025}>2025</option>
                                        <option value={2026}>2026</option>
                                        <option value={2027}>2027</option>
                                        <option value={2028}>2028</option>
                                   </select>
                              </div>
                         </div>
                    )}
               </div>

               <div className="timeline-container">
                    <TimelineView
                         groupedAllocations={groupedAllocations}
                         selectedYear={selectedYear}
                    />
               </div>
          </div>
     );
};

const ManagementView = ({ clients, resources, milestones, allocations, refreshData }) => {
     const [activeTab, setActiveTab] = useState('clients');

     return (
          <div className="management-container">
               <div className="management-header">
                    <h1>Resource Management</h1>
                    <p style={{ color: '#666', marginTop: '10px' }}>
                         Management features will be implemented in a future update. Use SQL INSERT statements to modify data for now.
                    </p>
               </div>

               <div className="tabs">
                    <button
                         className={`tab ${activeTab === 'clients' ? 'active' : ''}`}
                         onClick={() => setActiveTab('clients')}
                    >
                         Clients & Projects
                    </button>
                    <button
                         className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
                         onClick={() => setActiveTab('resources')}
                    >
                         Resources
                    </button>
               </div>

               <div className="tab-content">
                    {activeTab === 'clients' && (
                         <div className="clients-panel">
                              <div className="panel-header">
                                   <h2>Clients ({clients.length})</h2>
                              </div>
                              <div className="items-list">
                                   {clients.map(client => (
                                        <div key={client.id} className="item-card">
                                             <div className="item-info">
                                                  <div className="item-details">
                                                       <h3>{client.name}</h3>
                                                       <p>{client.type} • {client.year}</p>
                                                       <p className="milestone-count">
                                                            {milestones.filter(m => m.clientId === client.id).length} milestones
                                                       </p>
                                                  </div>
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    )}

                    {activeTab === 'resources' && (
                         <div className="resources-panel">
                              <div className="panel-header">
                                   <h2>Resources ({resources.length})</h2>
                              </div>
                              <div className="items-list">
                                   {resources.map(resource => (
                                        <div key={resource.id} className="item-card">
                                             <div className="item-info">
                                                  <div className="item-details">
                                                       <h3>{resource.name}</h3>
                                                       <div className="type-badges">
                                                            {resource.types.map(type => (
                                                                 <span key={type} className="badge">{type}</span>
                                                            ))}
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   ))}
                              </div>
                         </div>
                    )}
               </div>
          </div>
     );
};

const TimelineView = ({ groupedAllocations, selectedYear }) => {
     const yearDays = useMemo(() => {
          const days = [];
          const startDate = new Date(selectedYear, 0, 1);

          for (let i = 0; i < 365; i++) {
               const date = new Date(startDate);
               date.setDate(date.getDate() + i);
               days.push(date);
          }

          return days;
     }, [selectedYear]);

     const calculateLanes = (allocations) => {
          if (allocations.length === 0) return { lanes: [], maxLanes: 1 };

          const sorted = [...allocations].sort((a, b) => a.startDate - b.startDate);

          const lanes = [];
          const laneAssignments = new Map();

          sorted.forEach(allocation => {
               let assignedLane = 0;
               let placed = false;

               while (!placed) {
                    const overlaps = Array.from(laneAssignments.entries()).some(([otherAlloc, lane]) => {
                         if (lane !== assignedLane) return false;

                         const otherStart = otherAlloc.startDate.getTime();
                         const otherEnd = otherAlloc.endDate.getTime();
                         const thisStart = allocation.startDate.getTime();
                         const thisEnd = allocation.endDate.getTime();

                         return (thisStart < otherEnd && thisEnd > otherStart);
                    });

                    if (!overlaps) {
                         laneAssignments.set(allocation, assignedLane);
                         placed = true;
                    } else {
                         assignedLane++;
                    }
               }
          });

          const maxLanes = Math.max(...Array.from(laneAssignments.values())) + 1;

          for (let i = 0; i < maxLanes; i++) {
               lanes[i] = [];
          }

          laneAssignments.forEach((lane, allocation) => {
               lanes[lane].push(allocation);
          });

          return { lanes, maxLanes };
     };

     const getMilestonePosition = (allocation) => {
          const yearStart = new Date(selectedYear, 0, 1);
          const startDay = Math.floor((allocation.startDate - yearStart) / (1000 * 60 * 60 * 24));
          const endDay = Math.floor((allocation.endDate - yearStart) / (1000 * 60 * 60 * 24));

          if (endDay < 0 || startDay >= 365) return null;

          const clippedStart = Math.max(0, startDay);
          const clippedEnd = Math.min(364, endDay);
          const width = clippedEnd - clippedStart + 1;

          return {
               left: `${(clippedStart / 365) * 100}%`,
               width: `${(width / 365) * 100}%`
          };
     };

     const clientColors = useMemo(() => {
          const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
          const colorMap = {};
          let colorIndex = 0;

          Object.values(groupedAllocations).forEach(resourceTypeGroup => {
               Object.values(resourceTypeGroup).forEach(resourceData => {
                    resourceData.allocations.forEach(allocation => {
                         if (!colorMap[allocation.clientId]) {
                              colorMap[allocation.clientId] = colors[colorIndex % colors.length];
                              colorIndex++;
                         }
                    });
               });
          });

          return colorMap;
     }, [groupedAllocations]);

     return (
          <div className="timeline">
               <div className="timeline-header">
                    <div className="resource-labels-header">Resource</div>
                    <div className="timeline-days">
                         {yearDays.map((date, i) => {
                              const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
                              const month = date.getMonth() + 1;
                              const day = date.getDate();

                              return (
                                   <div key={i} className="day-label" title={date.toLocaleDateString()}>
                                        <div className="day-date">{month}/{day}</div>
                                        <div className="day-name">{dayOfWeek}</div>
                                   </div>
                              );
                         })}
                    </div>
               </div>

               <div className="timeline-body">
                    {Object.entries(groupedAllocations).length === 0 ? (
                         <div className="no-data">No allocations found for selected filters</div>
                    ) : (
                         Object.entries(groupedAllocations).map(([resourceType, resourcesInType]) => (
                              <div key={resourceType} className="resource-type-group">
                                   <div className="resource-type-header">{resourceType}</div>

                                   {Object.entries(resourcesInType).map(([resourceId, resourceData]) => {
                                        const { lanes, maxLanes } = calculateLanes(resourceData.allocations);
                                        const rowHeight = maxLanes * 50;

                                        return (
                                             <div key={resourceId} className="resource-row" style={{ minHeight: `${rowHeight}px` }}>
                                                  <div className="resource-label" style={{ minHeight: `${rowHeight}px` }}>
                                                       {resourceData.resourceName}
                                                  </div>
                                                  <div className="timeline-bars" style={{ minHeight: `${rowHeight}px` }}>
                                                       {lanes.map((laneAllocations, laneIndex) => (
                                                            <div key={laneIndex} className="timeline-lane" style={{ top: `${laneIndex * 50}px` }}>
                                                                 {laneAllocations.map(allocation => {
                                                                      const position = getMilestonePosition(allocation);
                                                                      if (!position) return null;

                                                                      return (
                                                                           <div
                                                                                key={allocation.id}
                                                                                className="milestone-bar"
                                                                                style={{
                                                                                     ...position,
                                                                                     backgroundColor: clientColors[allocation.clientId]
                                                                                }}
                                                                                title={`${allocation.clientName} - ${allocation.milestoneName}\n${allocation.startDate.toLocaleDateString()} - ${allocation.endDate.toLocaleDateString()}`}
                                                                           >
                                                                                <span className="milestone-label">
                                                                                     {allocation.clientName.substring(0, 15)}... - {allocation.milestoneName}
                                                                                </span>
                                                                           </div>
                                                                      );
                                                                 })}
                                                            </div>
                                                       ))}
                                                  </div>
                                             </div>
                                        );
                                   })}
                              </div>
                         ))
                    )}
               </div>
          </div>
     );
};

export default ResourceAllocationDashboard;