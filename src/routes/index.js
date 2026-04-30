const express = require('express');

const authRoutes = require('./auth');
const usuarioRoutes = require('./usuarioRoutes');
const empresaRoutes = require('./empresaRoutes');
const usuarioEmpresaRoutes = require('./usuarioEmpresaRoutes');
const produtoRoutes = require('./produtoRoutes');
const pedidoRoutes = require('./pedidoRoutes');
const favoritoRoutes = require('./favoritoRoutes');
const carrinhoRoutes = require('./carrinhoRoutes');
const avaliacaoRoutes = require('./avaliacaoRoutes');
const cupomRoutes = require('./cupomRoutes');

const router = express.Router();

// Rotas
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/empresas', empresaRoutes);
router.use('/usuario-empresa', usuarioEmpresaRoutes);
router.use('/produtos', produtoRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/favoritos', favoritoRoutes);
router.use('/carrinho', carrinhoRoutes);
router.use('/avaliacoes', avaliacaoRoutes);
router.use('/cupons', cupomRoutes);

router.get('/', (req, res) => {
    res.send('API Iron Store operando...');
});


module.exports = router;
