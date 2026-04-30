const db = require('../config/database');

// Listar produtos de uma empresa específica (Multi-tenant)
exports.getProdutosPorEmpresa = async (req, res) => {
    const { empresa_id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT p.*, tp.nome as categoria,
            (SELECT COUNT(*) FROM avaliacoes a JOIN produtos p2 ON a.produto_id = p2.id WHERE TRIM(LOWER(p2.nome)) = TRIM(LOWER(p.nome))) as reviews_count,
            (SELECT AVG(a.nota) FROM avaliacoes a JOIN produtos p2 ON a.produto_id = p2.id WHERE TRIM(LOWER(p2.nome)) = TRIM(LOWER(p.nome))) as rating_avg
            FROM produtos p
            LEFT JOIN tipos_produtos tp ON p.tipo_id = tp.id
            WHERE p.empresa_id = ? AND p.status = 'ativo'`, 
            [empresa_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar um único produto
exports.getProdutoById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT p.*, tp.nome as categoria,
            (SELECT COUNT(*) FROM avaliacoes a JOIN produtos p2 ON a.produto_id = p2.id WHERE LOWER(p2.nome) = LOWER(p.nome)) as reviews_count,
            (SELECT AVG(a.nota) FROM avaliacoes a JOIN produtos p2 ON a.produto_id = p2.id WHERE LOWER(p2.nome) = LOWER(p.nome)) as rating_avg
            FROM produtos p
            LEFT JOIN tipos_produtos tp ON p.tipo_id = tp.id
            WHERE p.id = ?`, 
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Criar produto
exports.createProduto = async (req, res) => {
    const { nome, descricao, preco, preco_antigo, estoque, imagem_url, tipo_id, empresa_id } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO produtos (nome, descricao, preco, preco_antigo, estoque, imagem_url, tipo_id, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nome, descricao, preco, preco_antigo, estoque, imagem_url, tipo_id, empresa_id]
        );
        res.status(201).json({ id: result.insertId, message: 'Produto criado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Categorias (Tipos)
exports.getCategoriasPorEmpresa = async (req, res) => {
    const { empresa_id } = req.params;
    try {
        const [rows] = await db.query('SELECT * FROM tipos_produtos WHERE empresa_id = ?', [empresa_id]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createCategoria = async (req, res) => {
    const { nome, empresa_id } = req.body;
    try {
        const [result] = await db.query('INSERT INTO tipos_produtos (nome, empresa_id) VALUES (?, ?)', [nome, empresa_id]);
        res.status(201).json({ id: result.insertId, message: 'Categoria criada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Atualizar produto
exports.updateProduto = async (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco, preco_antigo, estoque, imagem_url, tipo_id } = req.body;
    try {
        await db.query(
            'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, preco_antigo = ?, estoque = ?, imagem_url = ?, tipo_id = ? WHERE id = ?',
            [nome, descricao, preco, preco_antigo, estoque, imagem_url, tipo_id, id]
        );
        res.json({ message: 'Produto atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Excluir produto (ou desativar)
exports.deleteProduto = async (req, res) => {
    const { id } = req.params;
    try {
        // Opção 1: Excluir fisicamente
        // await db.query('DELETE FROM produtos WHERE id = ?', [id]);
        
        // Opção 2: Soft delete (mudar status para inativo)
        await db.query("UPDATE produtos SET status = 'inativo' WHERE id = ?", [id]);
        
        res.json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCategoria = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM tipos_produtos WHERE id = ?', [id]);
        res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
