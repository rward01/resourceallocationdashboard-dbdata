import React, { useState, useMemo, useEffect } from 'react';
import './App.css';
import { MILESTONE_TYPES } from './constants/constants';
import { fetchAllData } from './services/api';
import DashboardView from './components/DashboardView';
import ManagementView from './components/ManagementView';

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
          loadData();
     }, []);

     const loadData = async () => {
          setLoading(true);
          setError(null);

          try {
               const data = await fetchAllData();
               setClients(data.clients);
               setResources(data.resources);
               setMilestones(data.milestones);
               setAllocations(data.allocations);
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
                         onClick={loadData}
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
               <nav className="main-nav compact">
                    <div className="nav-brand compact">Resource Allocation System</div>
                    <div className="nav-buttons">
                         <button
                              className={`nav-btn compact ${currentView === 'dashboard' ? 'active' : ''}`}
                              onClick={() => setCurrentView('dashboard')}
                         >
                              📊 Dashboard
                         </button>
                         <button
                              className={`nav-btn compact ${currentView === 'management' ? 'active' : ''}`}
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
                         refreshData={loadData}
                    />
               ) : (
                    <ManagementView
                         clients={clients}
                         resources={resources}
                         milestones={milestones}
                         allocations={allocations}
                         refreshData={loadData}
                    />
               )}
          </div>
     );
};

export default ResourceAllocationDashboard;