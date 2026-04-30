const db = require('../config/database');

exports.getEmpresas = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM empresas');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createEmpresa = async (req, res) => {
    const { cnpj, nome_fantasia, razao_social, unidade } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO empresas (cnpj, nome_fantasia, razao_social, unidade) VALUES (?, ?, ?, ?)',
            [cnpj, nome_fantasia, razao_social, unidade]
        );
        res.status(201).json({ id: result.insertId, cnpj, nome_fantasia, unidade });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
