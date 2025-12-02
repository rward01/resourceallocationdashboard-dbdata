const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        const result = await pool.request().query('SELECT * FROM Clients');
        
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: result.recordset
        };
    } catch (err) {
        context.log('Error:', err);
        context.res = {
            status: 500,
            body: { error: err.message }
        };
    }
};