const pool = require('./src/config/database');

async function fixMorePromotions() {
    try {
        console.log("--- Aplicando Promoções em Mais Categorias ---");

        // 1. Equipamentos e Roupas
        await pool.query(`UPDATE produtos SET preco_antigo = 180.00, preco = 144.00 WHERE nome LIKE '%Luva de Boxe%'`);
        await pool.query(`UPDATE produtos SET preco_antigo = 75.00, preco = 59.70 WHERE nome LIKE '%Ômega 3%'`);
        await pool.query(`UPDATE produtos SET preco_antigo = 65.00, preco = 49.99 WHERE nome LIKE '%Regata Performance%'`);
        await pool.query(`UPDATE produtos SET preco_antigo = 69.90, preco = 49.99 WHERE nome LIKE '%Short de Treino%'`);
        await pool.query(`UPDATE produtos SET preco_antigo = 45.00, preco = 29.90 WHERE nome LIKE '%Corda de Pular%'`);

        // 2. Apagar qualquer resquício de produtos promocionais duplicados que possam ter ficado
        const [promoCats] = await pool.query(`SELECT id FROM tipos_produtos WHERE nome = 'promoções'`);
        const promoCatIds = promoCats.map(c => c.id);
        
        if (promoCatIds.length > 0) {
            await pool.query(
                `DELETE FROM produtos WHERE tipo_id IN (?) AND nome NOT LIKE '%Combo%'`,
                [promoCatIds]
            );
        }

        console.log("Mais promoções aplicadas nas categorias originais!");
    } catch (error) {
        console.error("Erro:", error);
    } finally {
        process.exit();
    }
}

fixMorePromotions();
