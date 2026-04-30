const pool = require('./src/config/database');

async function updatePromotions() {
    try {
        console.log("--- Iniciando Atualização de Promoções ---");

        const empresas = [1, 2, 3, 4];

        // 1. Mapear Categoria 'promoções' para cada Empresa
        const [catRows] = await pool.query("SELECT id, empresa_id FROM tipos_produtos WHERE nome = 'promoções'");
        const promoCatMap = {};
        catRows.forEach(row => promoCatMap[row.empresa_id] = row.id);

        // 2. Lista de Produtos em Promoção
        const promocoes = [
            { nome: 'Whey Protein Isolado (900g)', preco: 136.00, preco_antigo: 160.00, img: '/img/whey.png' },
            { nome: 'Hipercalórico 3kg', preco: 129.90, preco_antigo: 150.00, img: '/img/hipercalorico.png' },
            { nome: 'Combo Whey + Creatina', preco: 199.90, preco_antigo: 240.00, img: '/img/combo.png' },
            { nome: 'Kimono Jiu Jitsu - Preto', preco: 380.00, preco_antigo: 422.10, img: '/img/kimono.png' }
        ];

        // 3. Atualizar ou Inserir Promoções para todas as empresas
        for (const empId of empresas) {
            const tipoId = promoCatMap[empId];
            if (!tipoId) continue;

            for (const p of promocoes) {
                // Tenta atualizar se já existir o produto com esse nome para essa empresa
                const [updateResult] = await pool.query(
                    `UPDATE produtos SET preco = ?, preco_antigo = ?, tipo_id = ? WHERE nome = ? AND empresa_id = ?`,
                    [p.preco, p.preco_antigo, tipoId, p.nome, empId]
                );

                if (updateResult.affectedRows === 0) {
                    // Se não existia, insere
                    await pool.query(
                        `INSERT INTO produtos (nome, preco, preco_antigo, estoque, imagem_url, tipo_id, empresa_id, status) 
                         VALUES (?, ?, ?, 50, ?, ?, ?, 'ativo')`,
                        [p.nome, p.preco, p.preco_antigo, p.img, tipoId, empId]
                    );
                }
            }
        }

        console.log("[OK] Promoções sincronizadas para todas as unidades.");
        console.log("--- Atualização Concluída ---");

    } catch (error) {
        console.error("[-] Erro ao atualizar promoções:", error);
    } finally {
        process.exit();
    }
}

updatePromotions();
