const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const router = express.Router();
const saltRounds = 10;

// Rota de registro de usuário
router.post("/register", async (req, res) => {
  const { email, password, nome, cpf } = req.body;

  if (!email || !password || !nome || !cpf) {
    return res.status(400).json({ error: "E-mail, senha, nome e CPF são obrigatórios." });
  }

  try {
    // Verifica se o usuário já existe
    const [existingUser] = await pool.query("SELECT * FROM usuarios WHERE email = ? OR cpf = ?", [email, cpf]);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "E-mail ou CPF já cadastrado." });
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insere o usuário no banco de dados
    await pool.query(
      "INSERT INTO usuarios (email, senha_hash, nome, cpf) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, nome, cpf]
    );

    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao registrar usuário." });
  }
});

// Rota de login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busca o usuário no banco de dados
    const [user] = await pool.query(`
      SELECT 
        id, 
        email, 
        nome,
        senha_hash,
         status
      FROM usuarios
      WHERE email = ?
    `, [email]);

    if (user.length === 0) {
      console.log("[-] Login falhou: Usuário não encontrado no banco para o e-mail:", email);
      return res.status(400).json({ error: "E-mail ou senha inválidos." });
    }

    const userData = user[0];
    console.log("[+] Usuário encontrado no banco:", {
      id: userData.id,
      email: userData.email,
      nome: userData.nome,
      senha_hash_existe: !!userData.senha_hash,
      status: userData.status
    });

    // Verifica se a senha está correta
    const validPassword = await bcrypt.compare(password, userData.senha_hash);
    console.log("[?] Comparação de senha:", validPassword ? "Sucesso" : "Falha");

    if (!validPassword) {
      return res.status(400).json({ error: "E-mail ou senha inválidos." });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: userData.id, email: userData.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Retorna tudo que o frontend precisa (sem senha_hash)
    res.json({
      token,
      user: {
        id: userData.id,
        email: userData.email,
        nome: userData.nome,
        status: userData.status
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao fazer login." });
  }
});

// Rota de redefinição de senha (sem autenticação)
router.post("/reset-password", async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (!email || !newPassword || !confirmPassword) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: "As senhas não coincidem." });
  }

  try {
    // Verifica se o usuário existe
    const [user] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);

    // Não expõe se existe ou não
    if (user.length === 0) {
      return res.status(200).json({ message: "Se o e-mail existir, a senha será redefinida." });
    }

    // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Atualiza a senha no banco
    await pool.query(
      "UPDATE usuarios SET senha_hash = ? WHERE email = ?",
      [hashedPassword, email]
    );

    res.status(200).json({ message: "Se o e-mail existir, a senha será redefinida." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao redefinir senha." });
  }
});

module.exports = router;
