const path = require('path');

// Usar o volume persistente para o banco de dados
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'guiamentos.db');

// No initDatabase(), use:
async function initDatabase() {
    db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Variável global para o banco de dados
let db;

// Inicializar banco de dados
async function initDatabase() {
    db = await open({
        filename: './guiamentos.db',
        driver: sqlite3.Database
    });

    // Criar tabelas
    await db.exec(`
        CREATE TABLE IF NOT EXISTS guias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS guiamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guia_id INTEGER NOT NULL,
            ingresso REAL DEFAULT 0,
            transporte REAL DEFAULT 0,
            bebida REAL DEFAULT 0,
            guiamento REAL DEFAULT 0,
            faturamento REAL DEFAULT 0,
            data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (guia_id) REFERENCES guias(id)
        );

        CREATE TABLE IF NOT EXISTS historico_calculos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lucro_guia1 REAL,
            lucro_guia2 REAL,
            lucro_total REAL,
            lucro_divisao REAL,
            data_calculo DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Inserir guias padrão se não existirem
    const guias = await db.get('SELECT COUNT(*) as count FROM guias');
    if (guias.count === 0) {
        await db.run('INSERT INTO guias (nome) VALUES (?)', ['Guia 1']);
        await db.run('INSERT INTO guias (nome) VALUES (?)', ['Guia 2']);
    }

    console.log('✅ Banco de dados inicializado com sucesso!');
}

// ============== ROTAS DA API ==============

// Salvar cálculo completo
app.post('/api/salvar-calculo', async (req, res) => {
    try {
        const { guia1, guia2 } = req.body;
        
        // Salvar dados do Guia 1
        await db.run(
            'INSERT INTO guiamentos (guia_id, ingresso, transporte, bebida, guiamento, faturamento) VALUES (1, ?, ?, ?, ?, ?)',
            [guia1.ingresso, guia1.transporte, guia1.bebida, guia1.guiamento, guia1.faturamento]
        );
        
        // Salvar dados do Guia 2
        await db.run(
            'INSERT INTO guiamentos (guia_id, ingresso, transporte, bebida, guiamento, faturamento) VALUES (2, ?, ?, ?, ?, ?)',
            [guia2.ingresso, guia2.transporte, guia2.bebida, guia2.guiamento, guia2.faturamento]
        );
        
        // Calcular lucros
        const custos1 = guia1.ingresso + guia1.transporte + guia1.bebida + guia1.guiamento;
        const custos2 = guia2.ingresso + guia2.transporte + guia2.bebida + guia2.guiamento;
        const lucro1 = guia1.faturamento - custos1;
        const lucro2 = guia2.faturamento - custos2;
        const lucroTotal = lucro1 + lucro2;
        const lucroDivisao = lucroTotal / 2;
        
        // Salvar no histórico
        await db.run(
            'INSERT INTO historico_calculos (lucro_guia1, lucro_guia2, lucro_total, lucro_divisao) VALUES (?, ?, ?, ?)',
            [lucro1, lucro2, lucroTotal, lucroDivisao]
        );
        
        res.json({ 
            success: true, 
            message: 'Cálculo salvo com sucesso!',
            lucro1, lucro2, lucroTotal, lucroDivisao
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Erro ao salvar cálculo' });
    }
});

// Buscar histórico de cálculos
app.get('/api/historico', async (req, res) => {
    try {
        const historico = await db.all(`
            SELECT * FROM historico_calculos 
            ORDER BY data_calculo DESC 
            LIMIT 50
        `);
        res.json(historico);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar relatório por período
app.get('/api/relatorio', async (req, res) => {
    try {
        const { inicio, fim } = req.query;
        let query = `
            SELECT 
                DATE(data_calculo) as data,
                COUNT(*) as total_calculos,
                SUM(lucro_total) as soma_lucros,
                AVG(lucro_total) as media_lucro
            FROM historico_calculos
        `;
        
        if (inicio && fim) {
            query += ` WHERE DATE(data_calculo) BETWEEN '${inicio}' AND '${fim}'`;
        }
        
        query += ` GROUP BY DATE(data_calculo) ORDER BY data DESC`;
        
        const relatorio = await db.all(query);
        res.json(relatorio);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar todos os guiamentos
app.get('/api/guiamentos', async (req, res) => {
    try {
        const guiamentos = await db.all(`
            SELECT 
                g.nome,
                gi.*,
                gi.ingresso + gi.transporte + gi.bebida + gi.guiamento as custo_total,
                gi.faturamento - (gi.ingresso + gi.transporte + gi.bebida + gi.guiamento) as lucro
            FROM guiamentos gi
            JOIN guias g ON gi.guia_id = g.id
            ORDER BY gi.data_registro DESC
            LIMIT 100
        `);
        res.json(guiamentos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Estatísticas gerais
app.get('/api/estatisticas', async (req, res) => {
    try {
        const stats = await db.get(`
            SELECT 
                COUNT(*) as total_calculos,
                SUM(lucro_total) as lucro_total_geral,
                AVG(lucro_total) as lucro_medio,
                MAX(lucro_total) as maior_lucro,
                MIN(lucro_total) as menor_lucro
            FROM historico_calculos
        `);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deletar cálculo específico
app.delete('/api/deletar-calculo/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.run('DELETE FROM historico_calculos WHERE id = ?', [id]);
        res.json({ success: true, message: 'Cálculo deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
async function startServer() {
    await initDatabase();
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
        console.log(`📊 Banco de dados: guiamentos.db`);
    });
}

startServer();
}