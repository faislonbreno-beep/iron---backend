const db = require('./src/config/database');
async function run() {
    try {
        await db.query("UPDATE tipos_produtos SET nome = 'Esportes' WHERE LOWER(nome) = 'equipamentos'");
        console.log('Categorias atualizadas para Esportes');
        
        // Também vamos atualizar os status dos pedidos para 'pago' por padrão se estiverem 'pendente' 
        // mas o usuário quer que os NOVOS sejam pagos por padrão.
    } catch(e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
