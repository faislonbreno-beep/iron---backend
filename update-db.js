const pool = require('./src/config/database');

async function updateDatabase() {
    try {
        console.log("--- Iniciando Atualização do Banco de Dados ---");

        const empresas = [1, 2, 3, 4];
        const categoriasNomes = ['suplementos', 'roupas', 'equipamentos', 'lutas', 'promoções'];

        // 1. Garantir Categorias para todas as empresas
        for (const empId of empresas) {
            for (const catNome of categoriasNomes) {
                await pool.query(
                    "INSERT INTO tipos_produtos (nome, empresa_id) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM tipos_produtos WHERE nome = ? AND empresa_id = ?)",
                    [catNome, empId, catNome, empId]
                );
            }
        }
        console.log("[OK] Categorias sincronizadas para todas as unidades.");

        // 2. Mapear Categorias (Nome -> ID) para cada Empresa
        const [catRows] = await pool.query("SELECT id, nome, empresa_id FROM tipos_produtos");
        const catMap = {};
        catRows.forEach(row => {
            if (!catMap[row.empresa_id]) catMap[row.empresa_id] = {};
            catMap[row.empresa_id][row.nome] = row.id;
        });

        // 3. Lista de Produtos Padrão
        const produtosPadrao = [
            { nome: 'Whey Protein Isolado (900g)', preco: 136.00, img: '/img/whey.png', cat: 'suplementos' },
            { nome: 'Creatina 300g', preco: 95.00, img: '/img/creatina.png', cat: 'suplementos' },
            { nome: 'Pré-Treino Explode (300g)', preco: 102.00, img: '/img/pre_workout.png', cat: 'suplementos' },
            { nome: 'Kimono Jiu Jitsu - Preto', preco: 422.10, img: '/img/kimono.png', cat: 'lutas' },
            { nome: 'Luva de Boxe Pro Elite', preco: 144.00, img: '/img/luva.png', cat: 'lutas' },
            { nome: 'Hipercalórico 3kg', preco: 129.90, img: '/img/hipercalorico.png', cat: 'promoções' },
            { nome: 'Ômega 3 Ultra', preco: 65.00, img: '/img/omega3.png', cat: 'suplementos' },
            { nome: 'Magnésio Inositol', preco: 98.90, img: '/img/magnesio.png', cat: 'suplementos' },
            { nome: 'Regata Performance', preco: 49.99, img: '/img/regata.png', cat: 'roupas' },
            { nome: 'Saco de Pancadas Profissional', preco: 249.90, img: '/img/saco2.png', cat: 'equipamentos' }
        ];

        // 4. Inserir Produtos para todas as empresas
        let produtosInseridos = 0;
        for (const empId of empresas) {
            for (const p of produtosPadrao) {
                const tipoId = catMap[empId][p.cat];
                if (!tipoId) continue;

                const [result] = await pool.query(
                    `INSERT INTO produtos (nome, preco, estoque, imagem_url, tipo_id, empresa_id, status) 
                     SELECT ?, ?, 50, ?, ?, ?, 'ativo'
                     WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = ? AND empresa_id = ?)`,
                    [p.nome, p.preco, p.img, tipoId, empId, p.nome, empId]
                );
                
                if (result.affectedRows > 0) produtosInseridos++;
            }
        }

        console.log(`[OK] ${produtosInseridos} novos produtos foram adicionados ao catálogo global.`);
        console.log("--- Atualização Concluída com Sucesso ---");

    } catch (error) {
        console.error("[-] Erro ao atualizar o banco de dados:", error);
    } finally {
        process.exit();
    }
}

updateDatabase();
