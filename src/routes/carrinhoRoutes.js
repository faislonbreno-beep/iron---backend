const express = require('express');
const router = express.Router();
const carrinhoController = require('../controllers/carrinhoController');

router.get('/:usuario_id', carrinhoController.getCarrinho);
router.post('/', carrinhoController.updateItemCarrinho);
router.delete('/:usuario_id', carrinhoController.clearCarrinho);

module.exports = router;
