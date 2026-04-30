const pool = require('./src/config/database');

async function checkSchema() {
    try {
        console.log("--- Pedidos ---");
        const [pedidos] = await pool.query("DESCRIBE pedidos");
        console.table(pedidos);

        console.log("--- Cupons ---");
        const [cupons] = await pool.query("DESCRIBE cupons");
        console.table(cupons);
        
        const [rows] = await pool.query("SELECT * FROM cupons");
        console.log("Data in cupons:");
        console.table(rows);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit();
    }
}

checkSchema();
