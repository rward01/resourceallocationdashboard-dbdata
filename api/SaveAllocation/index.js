const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        const allocation = req.body;

        if (req.method === 'POST') {
            // Insert new allocation
            await pool.request()
                .input('AllocationId', sql.NVarChar, allocation.id)
                .input('ResourceId', sql.NVarChar, allocation.resourceId)
                .input('ResourceName', sql.NVarChar, allocation.resourceName)
                .input('MilestoneId', sql.NVarChar, allocation.milestoneId)
                .input('MilestoneName', sql.NVarChar, allocation.milestoneName)
                .input('ClientId', sql.NVarChar, allocation.clientId)
                .input('ClientName', sql.NVarChar, allocation.clientName)
                .input('StartDate', sql.Date, allocation.startDate)
                .input('EndDate', sql.Date, allocation.endDate)
                .query('INSERT INTO Allocations (AllocationId, ResourceId, ResourceName, MilestoneId, MilestoneName, ClientId, ClientName, StartDate, EndDate) VALUES (@AllocationId, @ResourceId, @ResourceName, @MilestoneId, @MilestoneName, @ClientId, @ClientName, @StartDate, @EndDate)');
        } else if (req.method === 'PUT') {
            // Update allocation
            await pool.request()
                .input('AllocationId', sql.NVarChar, allocation.id)
                .input('ResourceId', sql.NVarChar, allocation.resourceId)
                .input('ResourceName', sql.NVarChar, allocation.resourceName)
                .input('StartDate', sql.Date, allocation.startDate)
                .input('EndDate', sql.Date, allocation.endDate)
                .query('UPDATE Allocations SET ResourceId = @ResourceId, ResourceName = @ResourceName, StartDate = @StartDate, EndDate = @EndDate WHERE AllocationId = @AllocationId');
        }

        context.res = {
            status: 200,
            body: { success: true }
        };
    } catch (err) {
        context.log('Error:', err);
        context.res = {
            status: 500,
            body: { error: err.message }
        };
    }
};