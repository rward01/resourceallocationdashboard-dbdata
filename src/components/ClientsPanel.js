import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';
import { MILESTONE_TYPES } from '../constants/constants';
import { saveClient, deleteClient, saveMilestone, deleteMilestone } from '../services/api';

const ClientsPanel = ({ clients, milestones, refreshData }) => {
     const [editingClient, setEditingClient] = useState(null);
     const [localClients, setLocalClients] = useState(clients);
     const [localMilestones, setLocalMilestones] = useState(milestones);
     const [saving, setSaving] = useState(false);

     const addNewClient = () => {
          const newClient = {
               id: `client-new-${Date.now()}`,
               name: '',
               type: 'Merger',
               year: 2025,
               isNew: true
          };
          setLocalClients([...localClients, newClient]);
          setEditingClient(newClient.id);
     };

     const updateLocalClient = (id, field, value) => {
          setLocalClients(localClients.map(c =>
               c.id === id ? { ...c, [field]: value } : c
          ));
     };

     const handleSaveClient = async (client) => {
          setSaving(true);
          try {
               await saveClient(client, client.isNew);
               await refreshData();
               setEditingClient(null);
          } catch (err) {
               alert('Error saving client: ' + err.message);
          }
          setSaving(false);
     };

     const handleDeleteClient = async (id) => {
          if (window.confirm('Delete this client and all associated milestones?')) {
               setSaving(true);
               try {
                    await deleteClient(id);
                    await refreshData();
               } catch (err) {
                    alert('Error deleting client: ' + err.message);
               }
               setSaving(false);
          }
     };

     const addMilestoneToClient = async (clientId) => {
          const client = localClients.find(c => c.id === clientId);
          if (!client) return;

          const newMilestone = {
               id: `milestone-${clientId}-${Date.now()}`,
               clientId: clientId,
               clientName: client.name,
               name: 'Mapping Slice Due',
               startDate: new Date().toISOString().split('T')[0],
               endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
               duration: 7
          };

          setSaving(true);
          try {
               await saveMilestone(newMilestone, true);
               await refreshData();
          } catch (err) {
               alert('Error adding milestone: ' + err.message);
          }
          setSaving(false);
     };

     const updateLocalMilestone = (id, field, value) => {
          setLocalMilestones(localMilestones.map(m =>
               m.id === id ? { ...m, [field]: value } : m
          ));
     };

     const handleSaveMilestone = async (milestone) => {
          setSaving(true);
          try {
               await saveMilestone(milestone, false);
               await refreshData();
          } catch (err) {
               alert('Error saving milestone: ' + err.message);
          }
          setSaving(false);
     };

     const handleDeleteMilestone = async (id) => {
          if (window.confirm('Delete this milestone?')) {
               setSaving(true);
               try {
                    await deleteMilestone(id);
                    await refreshData();
               } catch (err) {
                    alert('Error deleting milestone: ' + err.message);
               }
               setSaving(false);
          }
     };

     return (
          <div className="clients-panel">
               <div className="panel-header">
                    <h2>Clients & Projects</h2>
                    <button className="add-btn" onClick={addNewClient} disabled={saving}>
                         <Plus size={18} /> Add Client
                    </button>
               </div>

               <div className="items-list">
                    {localClients.map(client => (
                         <div key={client.id} className="item-card">
                              {editingClient === client.id ? (
                                   <div className="edit-form">
                                        <input
                                             type="text"
                                             placeholder="Client Name"
                                             value={client.name}
                                             onChange={(e) => updateLocalClient(client.id, 'name', e.target.value)}
                                             className="edit-input"
                                        />
                                        <select
                                             value={client.type}
                                             onChange={(e) => updateLocalClient(client.id, 'type', e.target.value)}
                                             className="edit-select"
                                        >
                                             <option value="Merger">Merger</option>
                                             <option value="NewBus">NewBus</option>
                                        </select>
                                        <select
                                             value={client.year}
                                             onChange={(e) => updateLocalClient(client.id, 'year', parseInt(e.target.value))}
                                             className="edit-select"
                                        >
                                             <option value={2025}>2025</option>
                                             <option value={2026}>2026</option>
                                             <option value={2027}>2027</option>
                                             <option value={2028}>2028</option>
                                        </select>
                                        <button
                                             className="icon-btn save"
                                             onClick={() => handleSaveClient(client)}
                                             disabled={saving}
                                        >
                                             <Save size={16} />
                                        </button>
                                   </div>
                              ) : (
                                   <div className="item-info">
                                        <div className="item-details">
                                             <h3>{client.name || '(Unnamed Client)'}</h3>
                                             <p>{client.type} • {client.year}</p>
                                             <p className="milestone-count">
                                                  {localMilestones.filter(m => m.clientId === client.id).length} milestones
                                             </p>
                                        </div>
                                        <div className="item-actions">
                                             <button className="icon-btn" onClick={() => setEditingClient(client.id)} disabled={saving}>
                                                  <Edit2 size={16} />
                                             </button>
                                             <button className="icon-btn" onClick={() => addMilestoneToClient(client.id)} disabled={saving}>
                                                  <Plus size={16} /> Milestone
                                             </button>
                                             <button className="icon-btn delete" onClick={() => handleDeleteClient(client.id)} disabled={saving}>
                                                  <Trash2 size={16} />
                                             </button>
                                        </div>
                                   </div>
                              )}

                              {localMilestones.filter(m => m.clientId === client.id).length > 0 && (
                                   <div className="milestones-list">
                                        {localMilestones.filter(m => m.clientId === client.id).map(milestone => (
                                             <div key={milestone.id} className="milestone-item">
                                                  <select
                                                       value={milestone.name}
                                                       onChange={(e) => updateLocalMilestone(milestone.id, 'name', e.target.value)}
                                                       onBlur={() => handleSaveMilestone(milestone)}
                                                       className="milestone-select"
                                                       disabled={saving}
                                                  >
                                                       {MILESTONE_TYPES.map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                       ))}
                                                  </select>
                                                  <input
                                                       type="date"
                                                       value={milestone.startDate instanceof Date ? milestone.startDate.toISOString().split('T')[0] : milestone.startDate}
                                                       onChange={(e) => updateLocalMilestone(milestone.id, 'startDate', e.target.value)}
                                                       onBlur={() => handleSaveMilestone(milestone)}
                                                       className="date-input"
                                                       disabled={saving}
                                                  />
                                                  <input
                                                       type="date"
                                                       value={milestone.endDate instanceof Date ? milestone.endDate.toISOString().split('T')[0] : milestone.endDate}
                                                       onChange={(e) => updateLocalMilestone(milestone.id, 'endDate', e.target.value)}
                                                       onBlur={() => handleSaveMilestone(milestone)}
                                                       className="date-input"
                                                       disabled={saving}
                                                  />
                                                  <button
                                                       className="icon-btn delete small"
                                                       onClick={() => handleDeleteMilestone(milestone.id)}
                                                       disabled={saving}
                                                  >
                                                       <Trash2 size={14} />
                                                  </button>
                                             </div>
                                        ))}
                                   </div>
                              )}
                         </div>
                    ))}
               </div>
          </div>
     );
};

export default ClientsPanel;