import React, { useState } from 'react';
import { RESOURCE_TYPES } from '../constants/constants';
import { updateClientAllocations } from '../services/api';

const AssignmentsPanel = ({ clients, resources, allocations, refreshData }) => {
     const [saving, setSaving] = useState(false);

     const getClientAssignments = (clientId) => {
          const assignments = {};
          RESOURCE_TYPES.forEach(type => {
               const allocation = allocations.find(a =>
                    a.clientId === clientId &&
                    resources.find(r => r.id === a.resourceId && r.types.includes(type))
               );
               assignments[type] = allocation ? allocation.resourceId : null;
          });
          return assignments;
     };

     const handleAssignResource = async (clientId, resourceType, resourceId) => {
          if (!resourceId) return;

          setSaving(true);
          try {
               await updateClientAllocations(clientId, resourceType, resourceId);
               await refreshData();
          } catch (err) {
               alert('Error updating allocations: ' + err.message);
          }
          setSaving(false);
     };

     return (
          <div className="assignments-panel">
               <div className="panel-header">
                    <h2>Resource Assignments</h2>
                    <p className="help-text">Assign one resource per type to each client project</p>
               </div>

               <div className="items-list">
                    {clients.map(client => {
                         const assignments = getClientAssignments(client.id);
                         return (
                              <div key={client.id} className="assignment-card">
                                   <h3>{client.name}</h3>
                                   <div className="assignment-grid">
                                        {RESOURCE_TYPES.map(type => {
                                             const availableResources = resources.filter(r => r.types.includes(type));
                                             return (
                                                  <div key={type} className="assignment-row">
                                                       <label>{type}:</label>
                                                       <select
                                                            value={assignments[type] || ''}
                                                            onChange={(e) => handleAssignResource(client.id, type, e.target.value)}
                                                            className="assignment-select"
                                                            disabled={saving}
                                                       >
                                                            <option value="">-- Select Resource --</option>
                                                            {availableResources.map(r => (
                                                                 <option key={r.id} value={r.id}>{r.name}</option>
                                                            ))}
                                                       </select>
                                                  </div>
                                             );
                                        })}
                                   </div>
                              </div>
                         );
                    })}
               </div>
          </div>
     );
};

export default AssignmentsPanel;