const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        const { clientId, resourceType, resourceId } = req.body;

        // Get the resource info
        const resourceResult = await pool.request()
            .input('ResourceId', sql.NVarChar, resourceId)
            .query('SELECT ResourceName FROM Resources WHERE ResourceId = @ResourceId');
        
        if (resourceResult.recordset.length === 0) {
            context.res = {
                status: 404,
                body: { error: 'Resource not found' }
            };
            return;
        }

        const resourceName = resourceResult.recordset[0].ResourceName;

        // Get all milestones for this client
        const milestonesResult = await pool.request()
            .input('ClientId', sql.NVarChar, clientId)
            .query('SELECT * FROM Milestones WHERE ClientId = @ClientId');

        // Delete existing allocations for this client and resource type
        await pool.request()
            .input('ClientId', sql.NVarChar, clientId)
            .query(`DELETE FROM Allocations WHERE ClientId = @ClientId AND ResourceId IN (
                SELECT ResourceId FROM ResourceTypes WHERE ResourceType = '${resourceType}'
            )`);

        // Insert new allocations for each milestone
        let counter = 1;
        for (const milestone of milestonesResult.recordset) {
            const allocationId = `allocation-${Date.now()}-${counter++}`;
            
            await pool.request()
                .input('AllocationId', sql.NVarChar, allocationId)
                .input('ResourceId', sql.NVarChar, resourceId)
                .input('ResourceName', sql.NVarChar, resourceName)
                .input('MilestoneId', sql.NVarChar, milestone.MilestoneId)
                .input('MilestoneName', sql.NVarChar, milestone.MilestoneName)
                .input('ClientId', sql.NVarChar, milestone.ClientId)
                .input('ClientName', sql.NVarChar, milestone.ClientName)
                .input('StartDate', sql.Date, milestone.StartDate)
                .input('EndDate', sql.Date, milestone.EndDate)
                .query('INSERT INTO Allocations (AllocationId, ResourceId, ResourceName, MilestoneId, MilestoneName, ClientId, ClientName, StartDate, EndDate) VALUES (@AllocationId, @ResourceId, @ResourceName, @MilestoneId, @MilestoneName, @ClientId, @ClientName, @StartDate, @EndDate)');
        }

        context.res = {
            status: 200,
            body: { success: true, allocationsCreated: milestonesResult.recordset.length }
        };
    } catch (err) {
        context.log('Error:', err);
        context.res = {
            status: 500,
            body: { error: err.message }
        };
    }
};