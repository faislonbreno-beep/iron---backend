const db = require('./src/config/database');

async function run() {
    try {
        console.log('Iniciando limpeza de categorias...');
        
        // 1. Mapeamento de categorias para unificar
        // Queremos: 'Roupas', 'Esportes', 'Suplementos', 'Promoções'
        
        const mapping = {
            'lutas': 'Esportes',
            'equipamentos': 'Esportes',
            'moda fitness': 'Roupas',
            'suplementos': 'Suplementos',
            'promoções': 'Promoções'
        };

        // Buscar todas as categorias
        const [cats] = await db.query('SELECT * FROM tipos_produtos');
        
        for (const cat of cats) {
            const lowerName = cat.nome.toLowerCase();
            let targetName = mapping[lowerName] || cat.nome;
            
            // Garantir que a primeira letra é maiúscula (estilo solicitado)
            targetName = targetName.charAt(0).toUpperCase() + targetName.slice(1).toLowerCase();
            
            if (cat.nome !== targetName) {
                console.log(`Renomeando ${cat.nome} para ${targetName}`);
                await db.query('UPDATE tipos_produtos SET nome = ? WHERE id = ?', [targetName, cat.id]);
            }
        }

        // 2. Mesclar categorias duplicadas por empresa
        const [allCats] = await db.query('SELECT * FROM tipos_produtos');
        const seen = {}; // { empresa_id: { nome: id } }
        
        for (const cat of allCats) {
            if (!seen[cat.empresa_id]) seen[cat.empresa_id] = {};
            
            if (seen[cat.empresa_id][cat.nome]) {
                const targetId = seen[cat.empresa_id][cat.nome];
                console.log(`Mesclando categoria ${cat.id} em ${targetId} para empresa ${cat.empresa_id}`);
                // Mover produtos
                await db.query('UPDATE produtos SET tipo_id = ? WHERE tipo_id = ?', [targetId, cat.id]);
                // Deletar categoria duplicada
                await db.query('DELETE FROM tipos_produtos WHERE id = ?', [cat.id]);
            } else {
                seen[cat.empresa_id][cat.nome] = cat.id;
            }
        }

        console.log('Categorias limpas e mescladas.');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
