import React from 'react';
import { Calendar, Users, Briefcase, CheckSquare } from 'lucide-react';
import TimelineView from './TimelineView';

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

export default DashboardView;