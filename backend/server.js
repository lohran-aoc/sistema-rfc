const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;  // ← NÃO MUDE ISSO!

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/api/status', (req, res) => {
    res.json({ 
        status: 'online', 
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor - NÃO defina a porta manualmente!
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
    console.log(`📁 Frontend: ${path.join(__dirname, '../frontend')}`);
});