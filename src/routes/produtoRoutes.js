const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

router.get('/empresa/:empresa_id', produtoController.getProdutosPorEmpresa);
router.get('/:id', produtoController.getProdutoById);
router.post('/', produtoController.createProduto);
router.get('/categorias/:empresa_id', produtoController.getCategoriasPorEmpresa);
router.post('/categorias', produtoController.createCategoria);
router.delete('/categorias/:id', produtoController.deleteCategoria);
router.put('/:id', produtoController.updateProduto);
router.delete('/:id', produtoController.deleteProduto);

module.exports = router;
