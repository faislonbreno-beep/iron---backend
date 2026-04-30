const db = require('../config/database');

exports.getFavoritos = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT p.*, f.id as favorito_id 
            FROM produtos p
            JOIN favoritos f ON p.id = f.produto_id
            WHERE f.usuario_id = ?`, 
            [usuario_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addFavorito = async (req, res) => {
    const { usuario_id, produto_id } = req.body;
    try {
        await db.query('INSERT IGNORE INTO favoritos (usuario_id, produto_id) VALUES (?, ?)', [usuario_id, produto_id]);
        res.status(201).json({ message: 'Produto adicionado aos favoritos' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeFavorito = async (req, res) => {
    const { usuario_id, produto_id } = req.params;
    try {
        await db.query('DELETE FROM favoritos WHERE usuario_id = ? AND produto_id = ?', [usuario_id, produto_id]);
        res.json({ message: 'Produto removido dos favoritos' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
