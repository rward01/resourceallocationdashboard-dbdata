const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        const result = await pool.request().query('SELECT * FROM Milestones');
        
        const milestones = result.recordset.map(m => ({
            id: m.MilestoneId,
            clientId: m.ClientId,
            clientName: m.ClientName,
            name: m.MilestoneName,
            startDate: m.StartDate,
            endDate: m.EndDate,
            duration: m.Duration
        }));
        
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: milestones
        };
    } catch (err) {
        context.log('Error:', err);
        context.res = {
            status: 500,
            body: { error: err.message }
        };
    }
};