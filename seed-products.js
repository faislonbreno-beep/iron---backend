const pool = require('./src/config/database');

async function seed() {
    try {
        console.log("Iniciando restauração de dados...");

        // 1. Garantir categorias para Maracanã (ID 2)
        const categories = [
            { nome: 'lutas', empresa_id: 2 },
            { nome: 'promoções', empresa_id: 2 },
            { nome: 'suplementos', empresa_id: 2 },
            { nome: 'roupas', empresa_id: 2 },
            { nome: 'equipamentos', empresa_id: 2 }
        ];

        for (const cat of categories) {
            await pool.query(
                "INSERT INTO tipos_produtos (nome, empresa_id) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM tipos_produtos WHERE nome = ? AND empresa_id = ?)",
                [cat.nome, cat.empresa_id, cat.nome, cat.empresa_id]
            );
        }

        // Pegar os IDs das categorias inseridas/existentes
        const [catRows] = await pool.query("SELECT id, nome FROM tipos_produtos WHERE empresa_id = 2");
        const catMap = {};
        catRows.forEach(row => catMap[row.nome] = row.id);

        // 2. Restaurar Produtos para Maracanã
        const products = [
            { 
                nome: 'Kimono Jiu Jitsu - Preto', 
                preco: 422.10, 
                estoque: 10, 
                imagem_url: '/img/kimono.png', 
                tipo_nome: 'lutas',
                empresa_id: 2 
            },
            { 
                nome: 'Luva de Boxe Pro Elite 14oz', 
                preco: 144.00, 
                estoque: 15, 
                imagem_url: '/img/luva.png', 
                tipo_nome: 'lutas',
                empresa_id: 2 
            },
            { 
                nome: 'Bandagem de Boxe (2M) - Preto', 
                preco: 24.90, 
                estoque: 50, 
                imagem_url: '/img/bandagem.png', 
                tipo_nome: 'lutas',
                empresa_id: 2 
            },
            { 
                nome: 'Protetor Bucal', 
                preco: 39.90, 
                estoque: 100, 
                imagem_url: '/img/protetor_bucal.png', 
                tipo_nome: 'lutas',
                empresa_id: 2 
            },
            { 
                nome: 'Saco de Pancadas Profissional', 
                preco: 249.90, 
                estoque: 5, 
                imagem_url: '/img/saco2.png', 
                tipo_nome: 'lutas',
                empresa_id: 2 
            },
            { 
                nome: 'Hipercalórico 3kg - Baunilha', 
                preco: 129.90, 
                estoque: 30, 
                imagem_url: '/img/hipercalorico.png', 
                tipo_nome: 'promoções',
                empresa_id: 2 
            }
        ];

        for (const p of products) {
            const tipo_id = catMap[p.tipo_nome];
            await pool.query(
                `INSERT INTO produtos (nome, preco, estoque, imagem_url, tipo_id, empresa_id) 
                 SELECT ?, ?, ?, ?, ?, ? 
                 WHERE NOT EXISTS (SELECT 1 FROM produtos WHERE nome = ? AND empresa_id = ?)`,
                [p.nome, p.preco, p.estoque, p.imagem_url, tipo_id, p.empresa_id, p.nome, p.empresa_id]
            );
        }

        console.log("Restauração concluída com sucesso!");
    } catch (error) {
        console.error("Erro na restauração:", error);
    } finally {
        process.exit();
    }
}

seed();
