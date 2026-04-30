const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favoritoController');

router.get('/:usuario_id', favoritoController.getFavoritos);
router.post('/', favoritoController.addFavorito);
router.delete('/:usuario_id/:produto_id', favoritoController.removeFavorito);

module.exports = router;
