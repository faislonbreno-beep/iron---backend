const pool = require('./src/config/database');
pool.query('SELECT p.id, p.nome, p.preco, p.preco_antigo, t.nome as categoria FROM produtos p LEFT JOIN tipos_produtos t ON p.tipo_id = t.id WHERE p.preco_antigo IS NOT NULL')
  .then(([rows]) => {
      console.log("PROMOCOES:");
      console.log(JSON.stringify(rows, null, 2));
      process.exit();
  })
  .catch(console.error);
