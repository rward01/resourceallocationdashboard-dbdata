const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        const milestoneId = req.params.id;

        // Delete milestone (cascade will handle allocations)
        await pool.request()
            .input('MilestoneId', sql.NVarChar, milestoneId)
            .query('DELETE FROM Milestones WHERE MilestoneId = @MilestoneId');

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