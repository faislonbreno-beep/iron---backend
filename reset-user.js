const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');
require('dotenv').config();

async function resetPassword() {
    const email = 'admin@ironstore.com';
    const newPassword = '123456';
    const saltRounds = 10;

    try {
        console.log(`[!] Iniciando reset de senha para: ${email}`);
        
        // Gera o hash
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        console.log(`[+] Hash gerado com sucesso: ${hashedPassword}`);

        // Atualiza no banco
        const [result] = await pool.query(
            "UPDATE usuarios SET senha_hash = ? WHERE email = ?",
            [hashedPassword, email]
        );

        if (result.affectedRows > 0) {
            console.log(`[OK] Senha do usuário ${email} atualizada com sucesso!`);
        } else {
            console.log(`[!] Aviso: Nenhum usuário encontrado com o e-mail ${email}. Verifique se ele existe no banco.`);
        }

    } catch (error) {
        console.error("[-] Erro ao atualizar senha:", error);
    } finally {
        process.exit();
    }
}

resetPassword();
