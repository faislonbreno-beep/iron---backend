const db = require('../config/database');

exports.vincularUsuarioEmpresa = async (req, res) => {
    const { usuario_id, empresa_id, role } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO usuario_empresa (usuario_id, empresa_id, role) VALUES (?, ?, ?)',
            [usuario_id, empresa_id, role]
        );
        res.status(201).json({ id: result.insertId, message: 'Usuário vinculado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUsuariosPorEmpresa = async (req, res) => {
    const { empresa_id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT u.id, u.nome, u.email, ue.role 
            FROM usuarios u
            JOIN usuario_empresa ue ON u.id = ue.usuario_id
            WHERE ue.empresa_id = ?`, 
            [empresa_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
