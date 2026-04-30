const pool = require('./src/config/database');

async function fixPromotions() {
    try {
        console.log("--- Corrigindo Promoções ---");

        // 1. Atualizar os produtos originais para terem preco_antigo
        await pool.query(`UPDATE produtos SET preco_antigo = 160.00, preco = 136.00 WHERE nome LIKE '%Whey Protein Isolado 100%%'`);
        await pool.query(`UPDATE produtos SET preco_antigo = 99.90, preco = 89.90 WHERE nome LIKE '%Creatina Monohidratada Pura%'`);
        await pool.query(`UPDATE produtos SET preco_antigo = 120.00, preco = 102.00 WHERE nome LIKE '%Pré-Treino Explode%'`);
        await pool.query(`UPDATE produtos SET preco_antigo = 69.90, preco = 49.90 WHERE nome LIKE '%Multivitamínico%'`);
        await pool.query(`UPDATE produtos SET preco_antigo = 150.00, preco = 129.90 WHERE nome LIKE '%Hipercalórico 3kg%'`);
        await pool.query(`UPDATE produtos SET preco_antigo = 422.10, preco = 380.00 WHERE nome LIKE '%Kimono Jiu Jitsu - Preto%'`);

        // 2. O "Combo Whey + Creatina" foi criado por mim e está apenas na categoria "promoções".
        // Vamos movê-lo para a categoria "suplementos" (ou a correspondente) para que apareça nas duas abas.
        
        // Buscar IDs das categorias "suplementos"
        const [suplementos] = await pool.query(`SELECT id, empresa_id FROM tipos_produtos WHERE nome = 'suplementos'`);
        
        for (const sup of suplementos) {
            await pool.query(
                `UPDATE produtos SET tipo_id = ? WHERE nome LIKE '%Combo Whey%' AND empresa_id = ?`,
                [sup.id, sup.empresa_id]
            );
        }

        // 3. Deletar os produtos duplicados que criei na categoria "promoções" 
        // (Whey, Creatina, etc) exceto os que acabei de mover.
        const [promoCats] = await pool.query(`SELECT id FROM tipos_produtos WHERE nome = 'promoções'`);
        const promoCatIds = promoCats.map(c => c.id);
        
        if (promoCatIds.length > 0) {
            await pool.query(
                `DELETE FROM produtos WHERE tipo_id IN (?) AND nome NOT LIKE '%Combo%'`,
                [promoCatIds]
            );
        }

        console.log("Correção concluída!");
    } catch (error) {
        console.error("Erro:", error);
    } finally {
        process.exit();
    }
}

fixPromotions();
