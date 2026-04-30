const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.post('/', pedidoController.createPedido);
router.get('/empresa/:empresa_id', pedidoController.getPedidosPorEmpresa);
router.get('/usuario/:usuario_id', pedidoController.getPedidosPorUsuario);

router.put('/:id/status', pedidoController.updateStatus);

module.exports = router;
