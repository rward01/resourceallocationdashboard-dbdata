import React, { useState } from 'react';
import ClientsPanel from './ClientsPanel';
import ResourcesPanel from './ResourcesPanel';
import AssignmentsPanel from './AssignmentsPanel';

const ManagementView = ({ clients, resources, milestones, allocations, refreshData }) => {
     const [activeTab, setActiveTab] = useState('clients');

     return (
          <div className="management-container">
               <div className="management-header">
                    <h1>Resource Management</h1>
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
                    <button
                         className={`tab ${activeTab === 'assignments' ? 'active' : ''}`}
                         onClick={() => setActiveTab('assignments')}
                    >
                         Assignments
                    </button>
               </div>

               <div className="tab-content">
                    {activeTab === 'clients' && (
                         <ClientsPanel
                              clients={clients}
                              milestones={milestones}
                              refreshData={refreshData}
                         />
                    )}

                    {activeTab === 'resources' && (
                         <ResourcesPanel
                              resources={resources}
                              refreshData={refreshData}
                         />
                    )}

                    {activeTab === 'assignments' && (
                         <AssignmentsPanel
                              clients={clients}
                              resources={resources}
                              allocations={allocations}
                              refreshData={refreshData}
                         />
                    )}
               </div>
          </div>
     );
};

export default ManagementView;