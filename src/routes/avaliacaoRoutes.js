const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');

router.get('/:produto_id', avaliacaoController.getAvaliacoesPorProduto);
router.post('/', avaliacaoController.createAvaliacao);

module.exports = router;
