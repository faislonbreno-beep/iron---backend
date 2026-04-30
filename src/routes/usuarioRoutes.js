const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.get('/', usuarioController.getUsuarios);
router.get('/empresa/:empresaId', usuarioController.getUsuariosPorEmpresa);
router.post('/', usuarioController.createUsuario);
router.post('/login', usuarioController.login);
router.get('/:id', usuarioController.getUsuarioById);
router.put('/:id', usuarioController.updateUsuario);
router.put('/empresa/:empresaId/role', usuarioController.updateUsuarioRole);


module.exports = router;
