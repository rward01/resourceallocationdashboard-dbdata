const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        const milestone = req.body;

        if (req.method === 'POST') {
            // Insert new milestone
            await pool.request()
                .input('MilestoneId', sql.NVarChar, milestone.id)
                .input('ClientId', sql.NVarChar, milestone.clientId)
                .input('ClientName', sql.NVarChar, milestone.clientName)
                .input('MilestoneName', sql.NVarChar, milestone.name)
                .input('StartDate', sql.Date, milestone.startDate)
                .input('EndDate', sql.Date, milestone.endDate)
                .input('Duration', sql.Int, milestone.duration)
                .query('INSERT INTO Milestones (MilestoneId, ClientId, ClientName, MilestoneName, StartDate, EndDate, Duration) VALUES (@MilestoneId, @ClientId, @ClientName, @MilestoneName, @StartDate, @EndDate, @Duration)');
        } else if (req.method === 'PUT') {
            // Update milestone
            await pool.request()
                .input('MilestoneId', sql.NVarChar, milestone.id)
                .input('MilestoneName', sql.NVarChar, milestone.name)
                .input('StartDate', sql.Date, milestone.startDate)
                .input('EndDate', sql.Date, milestone.endDate)
                .input('Duration', sql.Int, milestone.duration)
                .query('UPDATE Milestones SET MilestoneName = @MilestoneName, StartDate = @StartDate, EndDate = @EndDate, Duration = @Duration WHERE MilestoneId = @MilestoneId');
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