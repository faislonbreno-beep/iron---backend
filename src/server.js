// Patch for Node v25 compatibility with older dependencies
const buffer = require('buffer');
if (!buffer.SlowBuffer) {
    buffer.SlowBuffer = buffer.Buffer;
}

console.log("Iniciando servidor...");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const morgan = require('morgan');
const routes = require("./routes");

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
    res.json({
        message: "Iron Store API está online!",
        status: "success",
        endpoints: ["/api"]
    });
});

app.use('/api', routes);

// Definir porta dinâmica para produção ou desenvolvimento
const port = process.env.PORT || 3000;

// Iniciar o servidor apenas se rodando localmente
if (require.main === module) {
    const server = app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Porta ${port} em uso, tentando outra...`);
            app.listen(0, () => {
                console.log(`Servidor rodando em uma porta aleatória`);
            });
        } else {
            console.error(err);
        }
    });
}

// Exportamos o app para a Vercel
module.exports = app;
