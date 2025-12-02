const sql = require('mssql');

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        
        const resourcesResult = await pool.request().query('SELECT * FROM Resources');
        const typesResult = await pool.request().query('SELECT * FROM ResourceTypes');
        
        const resources = resourcesResult.recordset.map(resource => ({
            id: resource.ResourceId,
            name: resource.ResourceName,
            types: typesResult.recordset
                .filter(rt => rt.ResourceId === resource.ResourceId)
                .map(rt => rt.ResourceType)
        }));
        
        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: resources
        };
    } catch (err) {
        context.log('Error:', err);
        context.res = {
            status: 500,
            body: { error: err.message }
        };
    }
};