const pool = require('./src/config/database');

async function fixDatabase() {
    try {
        console.log("--- Iniciando Correção do Banco ---");

        // 1. Adicionar coluna 'parcelas' em pedidos
        const [pedCols] = await pool.query("SHOW COLUMNS FROM pedidos LIKE 'parcelas'");
        if (pedCols.length === 0) {
            await pool.query("ALTER TABLE pedidos ADD COLUMN parcelas INT DEFAULT 1 AFTER metodo_pagamento");
            console.log("[OK] Coluna 'parcelas' adicionada em pedidos.");
        } else {
            console.log("[...] Coluna 'parcelas' já existe.");
        }

        // 2. Garantir que os cupons sejam do tipo 'porcentagem' para o frontend atual
        // O frontend usa desconto_percent e calcula (subtotal * discount) / 100
        await pool.query("UPDATE cupons SET tipo = 'porcentagem' WHERE codigo = 'BEMVINDO5' AND tipo = 'valor_fixo'");
        console.log("[OK] Cupom BEMVINDO5 ajustado para porcentagem.");

        console.log("--- Correção Concluída ---");
    } catch (error) {
        console.error("[-] Erro ao corrigir banco:", error);
    } finally {
        process.exit();
    }
}

fixDatabase();
