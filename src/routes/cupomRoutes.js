const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /cupons/:codigo - Valida e retorna dados do cupom
router.get('/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const [rows] = await db.query(
            `SELECT * FROM cupons 
             WHERE codigo = ? 
               AND status = 'ativo' 
               AND (data_expiracao IS NULL OR data_expiracao >= CURDATE())`,
            [codigo.toUpperCase()]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cupom inválido ou expirado.' });
        }

        const cupom = rows[0];
        res.json({
            id: cupom.id,
            codigo: cupom.codigo,
            desconto_percent: cupom.valor // No banco o campo valor armazena a porcentagem
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
