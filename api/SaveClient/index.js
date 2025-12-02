const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        const client = req.body;

        if (req.method === 'POST') {
            // Insert new client
            await pool.request()
                .input('ClientId', sql.NVarChar, client.id)
                .input('ClientName', sql.NVarChar, client.name)
                .input('ClientType', sql.NVarChar, client.type)
                .input('Year', sql.Int, client.year)
                .query('INSERT INTO Clients (ClientId, ClientName, ClientType, Year) VALUES (@ClientId, @ClientName, @ClientType, @Year)');
        } else if (req.method === 'PUT') {
            // Update existing client
            await pool.request()
                .input('ClientId', sql.NVarChar, client.id)
                .input('ClientName', sql.NVarChar, client.name)
                .input('ClientType', sql.NVarChar, client.type)
                .input('Year', sql.Int, client.year)
                .query('UPDATE Clients SET ClientName = @ClientName, ClientType = @ClientType, Year = @Year WHERE ClientId = @ClientId');
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