import { API_BASE_URL } from '../constants/constants';

// Fetch all data
export const fetchAllData = async () => {
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

     return {
          clients: clientsData.map(c => ({
               id: c.ClientId,
               name: c.ClientName,
               type: c.ClientType,
               year: c.Year
          })),
          resources: resourcesData,
          milestones: milestonesData.map(m => ({
               ...m,
               startDate: new Date(m.startDate),
               endDate: new Date(m.endDate)
          })),
          allocations: allocationsData.map(a => ({
               ...a,
               startDate: new Date(a.startDate),
               endDate: new Date(a.endDate)
          }))
     };
};

// Client APIs
export const saveClient = async (client, isNew) => {
     const method = isNew ? 'POST' : 'PUT';
     const response = await fetch(`${API_BASE_URL}/clients`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(client)
     });

     if (!response.ok) throw new Error('Failed to save client');
     return response.json();
};

export const deleteClient = async (clientId) => {
     const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
          method: 'DELETE'
     });

     if (!response.ok) throw new Error('Failed to delete client');
     return response.json();
};

// Resource APIs
export const saveResource = async (resource, isNew) => {
     const method = isNew ? 'POST' : 'PUT';
     const response = await fetch(`${API_BASE_URL}/resources`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resource)
     });

     if (!response.ok) throw new Error('Failed to save resource');
     return response.json();
};

export const deleteResource = async (resourceId) => {
     const response = await fetch(`${API_BASE_URL}/resources/${resourceId}`, {
          method: 'DELETE'
     });

     if (!response.ok) throw new Error('Failed to delete resource');
     return response.json();
};

// Milestone APIs
export const saveMilestone = async (milestone, isNew) => {
     const method = isNew ? 'POST' : 'PUT';
     const response = await fetch(`${API_BASE_URL}/milestones`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(milestone)
     });

     if (!response.ok) throw new Error('Failed to save milestone');
     return response.json();
};

export const deleteMilestone = async (milestoneId) => {
     const response = await fetch(`${API_BASE_URL}/milestones/${milestoneId}`, {
          method: 'DELETE'
     });

     if (!response.ok) throw new Error('Failed to delete milestone');
     return response.json();
};

// Allocation APIs
export const saveAllocation = async (allocation, isNew) => {
     const method = isNew ? 'POST' : 'PUT';
     const response = await fetch(`${API_BASE_URL}/allocations`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(allocation)
     });

     if (!response.ok) throw new Error('Failed to save allocation');
     return response.json();
};

export const deleteAllocation = async (allocationId) => {
     const response = await fetch(`${API_BASE_URL}/allocations/${allocationId}`, {
          method: 'DELETE'
     });

     if (!response.ok) throw new Error('Failed to delete allocation');
     return response.json();
};

export const updateClientAllocations = async (clientId, resourceType, resourceId) => {
     const response = await fetch(`${API_BASE_URL}/allocations/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId, resourceType, resourceId })
     });

     if (!response.ok) throw new Error('Failed to update allocations');
     return response.json();
};