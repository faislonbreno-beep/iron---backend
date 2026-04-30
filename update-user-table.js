const pool = require('./src/config/database');

async function updateTable() {
    try {
        console.log("--- Atualizando Tabela de Usuários ---");
        
        const [columns] = await pool.query("SHOW COLUMNS FROM usuarios LIKE 'foto_url'");
        
        if (columns.length === 0) {
            await pool.query(`
                ALTER TABLE usuarios 
                ADD COLUMN foto_url LONGTEXT DEFAULT NULL
            `);
            console.log("[OK] Coluna foto_url adicionada com sucesso!");
        } else {
            console.log("[INFO] Coluna foto_url já existe.");
        }
        
    } catch (error) {
        console.error("[-] Erro ao atualizar tabela:", error);
    } finally {
        process.exit();
    }
}

updateTable();
