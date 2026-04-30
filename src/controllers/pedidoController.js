const db = require('../config/database');

// Criar novo pedido
exports.createPedido = async (req, res) => {
    const { usuario_id, empresa_id, itens, metodo_pagamento, parcelas, cupom_id } = req.body;
    
    // Iniciar transação para garantir que o pedido e itens sejam salvos juntos
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Calcular o total base
        let total = 0;
        for (const item of itens) {
            const [prod] = await connection.query('SELECT preco FROM produtos WHERE id = ?', [item.produto_id]);
            if (prod.length === 0) throw new Error(`Produto ${item.produto_id} não encontrado`);
            total += prod[0].preco * item.quantidade;
            item.preco_unitario = prod[0].preco; // Salvar o preço atual
        }

        // 2. Validar e aplicar cupom se existir
        if (cupom_id) {
            const [rows] = await connection.query(
                "SELECT * FROM cupons WHERE id = ? AND status = 'ativo' AND (data_expiracao IS NULL OR data_expiracao >= CURDATE())",
                [cupom_id]
            );
            if (rows.length > 0) {
                const cupom = rows[0];
                if (total >= (cupom.valor_minimo_pedido || 0)) {
                    const desconto = (total * cupom.valor) / 100;
                    total -= desconto;
                }
            }
        }

        // 3. Adicionar frete se necessário (menos de 199)
        if (total < 199) {
            total += 20;
        }

        // 4. Criar o pedido
        const [pedidoResult] = await connection.query(
            'INSERT INTO pedidos (usuario_id, empresa_id, total, metodo_pagamento, parcelas, cupom_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [usuario_id, empresa_id, total, metodo_pagamento, parcelas || 1, cupom_id || null, 'pago']
        );
        const pedidoId = pedidoResult.insertId;

        // 5. Inserir os itens do pedido
        for (const item of itens) {
            await connection.query(
                'INSERT INTO pedidos_produtos (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                [pedidoId, item.produto_id, item.quantidade, item.preco_unitario]
            );

            // 6. Atualizar estoque
            await connection.query(
                'UPDATE produtos SET estoque = estoque - ? WHERE id = ?',
                [item.quantidade, item.produto_id]
            );
        }

        // 5. Limpar carrinho persistente
        const [carrinhos] = await connection.query('SELECT id FROM carrinhos WHERE usuario_id = ?', [usuario_id]);
        if (carrinhos.length > 0) {
            await connection.query('DELETE FROM carrinhos_itens WHERE carrinho_id = ?', [carrinhos[0].id]);
        }

        await connection.commit();
        res.status(201).json({ id: pedidoId, total, message: 'Pedido realizado com sucesso' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

// Listar pedidos de uma empresa (para o Gerente/Admin)
exports.getPedidosPorEmpresa = async (req, res) => {
    const { empresa_id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT p.*, u.nome as cliente_nome 
            FROM pedidos p
            JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.empresa_id = ?
            ORDER BY p.criado_em DESC`, 
            [empresa_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Listar pedidos de um usuário (Histórico do cliente)
exports.getPedidosPorUsuario = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT p.*, e.nome_fantasia as empresa_nome
            FROM pedidos p
            JOIN empresas e ON p.empresa_id = e.id
            WHERE p.usuario_id = ?
            ORDER BY p.criado_em DESC`, 
            [usuario_id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Atualizar status do pedido
exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await db.query('UPDATE pedidos SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
