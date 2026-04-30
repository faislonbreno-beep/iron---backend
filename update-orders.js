const db = require('./src/config/database');
async function run() {
    try {
        await db.query("UPDATE pedidos SET status = 'pago' WHERE status = 'pendente'");
        console.log('Pedidos antigos pendentes atualizados para pago');
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
