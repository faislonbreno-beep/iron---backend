const express = require('express');
const router = express.Router();
const ueController = require('../controllers/usuarioEmpresaController');

router.post('/vincular', ueController.vincularUsuarioEmpresa);
router.get('/empresa/:empresa_id', ueController.getUsuariosPorEmpresa);

module.exports = router;
