const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        const resource = req.body;

        if (req.method === 'POST') {
            // Insert new resource
            await pool.request()
                .input('ResourceId', sql.NVarChar, resource.id)
                .input('ResourceName', sql.NVarChar, resource.name)
                .query('INSERT INTO Resources (ResourceId, ResourceName) VALUES (@ResourceId, @ResourceName)');

            // Insert resource types
            for (const type of resource.types) {
                await pool.request()
                    .input('ResourceId', sql.NVarChar, resource.id)
                    .input('ResourceType', sql.NVarChar, type)
                    .query('INSERT INTO ResourceTypes (ResourceId, ResourceType) VALUES (@ResourceId, @ResourceType)');
            }
        } else if (req.method === 'PUT') {
            // Update resource name
            await pool.request()
                .input('ResourceId', sql.NVarChar, resource.id)
                .input('ResourceName', sql.NVarChar, resource.name)
                .query('UPDATE Resources SET ResourceName = @ResourceName WHERE ResourceId = @ResourceId');

            // Delete old types and insert new ones
            await pool.request()
                .input('ResourceId', sql.NVarChar, resource.id)
                .query('DELETE FROM ResourceTypes WHERE ResourceId = @ResourceId');

            for (const type of resource.types) {
                await pool.request()
                    .input('ResourceId', sql.NVarChar, resource.id)
                    .input('ResourceType', sql.NVarChar, type)
                    .query('INSERT INTO ResourceTypes (ResourceId, ResourceType) VALUES (@ResourceId, @ResourceType)');
            }
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