const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        const resourceId = req.params.id;

        // Delete resource (cascade will handle types and allocations)
        await pool.request()
            .input('ResourceId', sql.NVarChar, resourceId)
            .query('DELETE FROM Resources WHERE ResourceId = @ResourceId');

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