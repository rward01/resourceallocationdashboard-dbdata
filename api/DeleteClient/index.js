const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        const clientId = req.params.id;

        // Delete client (cascade will handle milestones and allocations)
        await pool.request()
            .input('ClientId', sql.NVarChar, clientId)
            .query('DELETE FROM Clients WHERE ClientId = @ClientId');

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