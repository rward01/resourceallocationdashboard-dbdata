const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        const result = await pool.request().query('SELECT * FROM Allocations');
        const typesResult = await pool.request().query('SELECT * FROM ResourceTypes');
        
        const allocations = result.recordset.map(a => {
            const resourceTypes = typesResult.recordset
                .filter(rt => rt.ResourceId === a.ResourceId)
                .map(rt => rt.ResourceType);
            
            return {
                id: a.AllocationId,
                resourceId: a.ResourceId,
                resourceName: a.ResourceName,
                resourceTypes: resourceTypes,
                milestoneId: a.MilestoneId,
                milestoneName: a.MilestoneName,
                clientId: a.ClientId,
                clientName: a.ClientName,
                startDate: a.StartDate,
                endDate: a.EndDate
            };
        });
        
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: allocations
        };
    } catch (err) {
        context.log('Error:', err);
        context.res = {
            status: 500,
            body: { error: err.message }
        };
    }
};