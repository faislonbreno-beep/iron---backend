const pool = require('./src/config/database');

async function applyFullUpdate() {
    try {
        console.log("--- Aplicando Atualização Completa do Banco ---");

        // 1. Tags em Produtos
        const [prodCols] = await pool.query("SHOW COLUMNS FROM produtos LIKE 'tags'");
        if (prodCols.length === 0) {
            await pool.query("ALTER TABLE produtos ADD COLUMN tags VARCHAR(255) DEFAULT NULL");
            console.log("[OK] Coluna 'tags' adicionada em produtos.");
        }

        // 2. Tabela de Cupons
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cupons (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo VARCHAR(50) UNIQUE NOT NULL,
                tipo ENUM('porcentagem', 'valor_fixo') NOT NULL,
                valor DECIMAL(10, 2) NOT NULL,
                valor_minimo_pedido DECIMAL(10, 2) DEFAULT 0,
                data_expiracao DATETIME,
                limite_uso INT DEFAULT NULL,
                usos_atuais INT DEFAULT 0,
                status ENUM('ativo', 'inativo') DEFAULT 'ativo',
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("[OK] Tabela 'cupons' verificada/criada.");

        // 3. Cupom nos Pedidos
        const [pedCols] = await pool.query("SHOW COLUMNS FROM pedidos LIKE 'cupom_id'");
        if (pedCols.length === 0) {
            await pool.query("ALTER TABLE pedidos ADD COLUMN cupom_id INT DEFAULT NULL AFTER metodo_pagamento");
            await pool.query("ALTER TABLE pedidos ADD CONSTRAINT fk_pedido_cupom FOREIGN KEY (cupom_id) REFERENCES cupons(id)");
            console.log("[OK] Coluna 'cupom_id' adicionada em pedidos.");
        }

        // 4. Inserir cupons iniciais
        await pool.query(`
            INSERT IGNORE INTO cupons (codigo, tipo, valor, valor_minimo_pedido, status) 
            VALUES ('IRON10', 'porcentagem', 10.00, 50.00, 'ativo'),
                   ('BEMVINDO5', 'valor_fixo', 5.00, 20.00, 'ativo')
        `);
        console.log("[OK] Cupons iniciais inseridos.");

        console.log("--- Atualização Concluída com Sucesso ---");

    } catch (error) {
        console.error("[-] Erro ao atualizar banco:", error);
    } finally {
        process.exit();
    }
}

applyFullUpdate();
