const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getUsuarios = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nome, email, cpf, telefone, criado_em FROM usuarios');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createUsuario = async (req, res) => {
    const { nome, cpf, email, password, senha, telefone } = req.body;
    const senhaFinal = password || senha;
    try {
        // Verificar se usuário existe
        const [existing] = await db.query('SELECT id FROM usuarios WHERE email = ? OR cpf = ?', [email, cpf]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'E-mail ou CPF já cadastrado' });
        }

        const senha_hash = await bcrypt.hash(senhaFinal, 10);
        const [result] = await db.query(
            'INSERT INTO usuarios (nome, cpf, email, senha_hash, telefone) VALUES (?, ?, ?, ?, ?)',
            [nome, cpf, email, senha_hash, telefone]
        );

        const id = result.insertId;

        // Gerar token para login automático após cadastro
        const token = jwt.sign(
            { id, email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({ 
            message: 'Cadastro realizado com sucesso',
            token,
            user: {
                id,
                nome,
                email,
                empresas: [] // Novo usuário começa sem empresas vinculadas
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password, senha } = req.body;
    const senhaFinal = password || senha;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos' });
        }

        const usuario = rows[0];
        const senhaValida = await bcrypt.compare(senhaFinal, usuario.senha_hash);

        if (!senhaValida) return res.status(401).json({ error: 'E-mail ou senha incorretos' });

        // Buscar empresas e roles vinculados a este usuário
        const [vinculos] = await db.query(`
            SELECT e.id, e.nome_fantasia, e.unidade, ue.role 
            FROM empresas e
            JOIN usuario_empresa ue ON e.id = ue.empresa_id
            WHERE ue.usuario_id = ?`, 
            [usuario.id]
        );

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                empresas: vinculos // Agora o frontend sabe onde o usuário trabalha/atua
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUsuarioById = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nome, email, cpf, telefone, foto_url, criado_em FROM usuarios WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { nome, email, telefone, foto_url } = req.body;
    try {
        await db.query(
            'UPDATE usuarios SET nome = ?, email = ?, telefone = ?, foto_url = ? WHERE id = ?',
            [nome, email, telefone, foto_url, id]
        );
        res.json({ message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUsuariosPorEmpresa = async (req, res) => {
    const { empresaId } = req.params;
    try {
        // Obter todos os usuários. Se o usuário tiver um role nesta empresa, traga-o. Caso não, será nulo.
        // O cliente quer ver os clientes e controlar suas funções.
        const [rows] = await db.query(`
            SELECT u.id, u.nome, u.email, u.cpf, u.telefone, u.criado_em, ue.role 
            FROM usuarios u
            LEFT JOIN usuario_empresa ue ON u.id = ue.usuario_id AND ue.empresa_id = ?
        `, [empresaId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUsuarioRole = async (req, res) => {
    const { empresaId } = req.params;
    const { usuario_id, role } = req.body;
    try {
        // Verifica se já existe um vínculo
        const [existing] = await db.query('SELECT * FROM usuario_empresa WHERE usuario_id = ? AND empresa_id = ?', [usuario_id, empresaId]);
        
        if (role === 'none') {
            if (existing.length > 0) {
                await db.query('DELETE FROM usuario_empresa WHERE usuario_id = ? AND empresa_id = ?', [usuario_id, empresaId]);
            }
        } else {
            if (existing.length > 0) {
                await db.query('UPDATE usuario_empresa SET role = ? WHERE usuario_id = ? AND empresa_id = ?', [role, usuario_id, empresaId]);
            } else {
                await db.query('INSERT INTO usuario_empresa (usuario_id, empresa_id, role) VALUES (?, ?, ?)', [usuario_id, empresaId, role]);
            }
        }
        res.json({ message: 'Role atualizada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
