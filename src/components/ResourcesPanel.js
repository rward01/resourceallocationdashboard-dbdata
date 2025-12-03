import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';
import { RESOURCE_TYPES } from '../constants/constants';
import { saveResource, deleteResource } from '../services/api';

const ResourcesPanel = ({ resources, refreshData }) => {
     const [editingResource, setEditingResource] = useState(null);
     const [localResources, setLocalResources] = useState(resources);
     const [saving, setSaving] = useState(false);

     const addNewResource = () => {
          const newResource = {
               id: `resource-new-${Date.now()}`,
               name: '',
               types: [],
               isNew: true
          };
          setLocalResources([...localResources, newResource]);
          setEditingResource(newResource.id);
     };

     const updateLocalResource = (id, field, value) => {
          setLocalResources(localResources.map(r =>
               r.id === id ? { ...r, [field]: value } : r
          ));
     };

     const toggleResourceType = (resourceId, type) => {
          setLocalResources(localResources.map(r => {
               if (r.id === resourceId) {
                    const hasType = r.types.includes(type);
                    return {
                         ...r,
                         types: hasType
                              ? r.types.filter(t => t !== type)
                              : [...r.types, type]
                    };
               }
               return r;
          }));
     };

     const handleSaveResource = async (resource) => {
          if (!resource.name.trim()) {
               alert('Resource name is required');
               return;
          }
          if (resource.types.length === 0) {
               alert('At least one resource type must be selected');
               return;
          }

          setSaving(true);
          try {
               await saveResource(resource, resource.isNew);
               await refreshData();
               setEditingResource(null);
          } catch (err) {
               alert('Error saving resource: ' + err.message);
          }
          setSaving(false);
     };

     const handleDeleteResource = async (id) => {
          if (window.confirm('Delete this resource?')) {
               setSaving(true);
               try {
                    await deleteResource(id);
                    await refreshData();
               } catch (err) {
                    alert('Error deleting resource: ' + err.message);
               }
               setSaving(false);
          }
     };

     return (
          <div className="resources-panel">
               <div className="panel-header">
                    <h2>Resources</h2>
                    <button className="add-btn" onClick={addNewResource} disabled={saving}>
                         <Plus size={18} /> Add Resource
                    </button>
               </div>

               <div className="items-list">
                    {localResources.map(resource => (
                         <div key={resource.id} className="item-card">
                              {editingResource === resource.id ? (
                                   <div className="edit-form">
                                        <input
                                             type="text"
                                             placeholder="Resource Name"
                                             value={resource.name}
                                             onChange={(e) => updateLocalResource(resource.id, 'name', e.target.value)}
                                             className="edit-input"
                                        />
                                        <div className="type-checkboxes">
                                             {RESOURCE_TYPES.map(type => (
                                                  <label key={type} className="checkbox-label">
                                                       <input
                                                            type="checkbox"
                                                            checked={resource.types.includes(type)}
                                                            onChange={() => toggleResourceType(resource.id, type)}
                                                            disabled={saving}
                                                       />
                                                       {type}
                                                  </label>
                                             ))}
                                        </div>
                                        <button
                                             className="icon-btn save"
                                             onClick={() => handleSaveResource(resource)}
                                             disabled={saving}
                                        >
                                             <Save size={16} />
                                        </button>
                                   </div>
                              ) : (
                                   <div className="item-info">
                                        <div className="item-details">
                                             <h3>{resource.name || '(Unnamed Resource)'}</h3>
                                             <div className="type-badges">
                                                  {resource.types.length > 0 ? (
                                                       resource.types.map(type => (
                                                            <span key={type} className="badge">{type}</span>
                                                       ))
                                                  ) : (
                                                       <span className="badge empty">No types assigned</span>
                                                  )}
                                             </div>
                                        </div>
                                        <div className="item-actions">
                                             <button
                                                  className="icon-btn"
                                                  onClick={() => setEditingResource(resource.id)}
                                                  disabled={saving}
                                             >
                                                  <Edit2 size={16} />
                                             </button>
                                             <button
                                                  className="icon-btn delete"
                                                  onClick={() => handleDeleteResource(resource.id)}
                                                  disabled={saving}
                                             >
                                                  <Trash2 size={16} />
                                             </button>
                                        </div>
                                   </div>
                              )}
                         </div>
                    ))}
               </div>
          </div>
     );
};

export default ResourcesPanel;
