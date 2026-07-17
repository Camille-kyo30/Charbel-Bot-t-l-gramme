// ========================================
// 🤖 MASTER CHARBEL BOT V2
// ========================================

require('dotenv').config();
const { Telegraf } = require('telegraf');
const fs = require('fs');
const express = require('express');
const path = require('path');
const axios = require('axios');
const config = require('./config.json');

// ========================================
// 📋 LOGGER AMÉLIORÉ
// ========================================

const logger = {
    log: (message) => console.log(`📝 [${new Date().toLocaleTimeString()}] ${message}`),
    info: (message) => console.log(`ℹ️ [${new Date().toLocaleTimeString()}] ${message}`),
    success: (message) => console.log(`✅ [${new Date().toLocaleTimeString()}] ${message}`),
    error: (message) => console.error(`❌ [${new Date().toLocaleTimeString()}] ${message}`),
    warn: (message) => console.warn(`⚠️ [${new Date().toLocaleTimeString()}] ${message}`),
    admin: (message) => console.log(`👑 [${new Date().toLocaleTimeString()}] ${message}`)
};

// ========================================
// 🔑 GESTION DU TOKEN (SÉCURISÉ)
// ========================================

let token;

// Essayer de lire depuis .env d'abord
if (process.env.BOT_TOKEN) {
    token = process.env.BOT_TOKEN;
    logger.success('Token chargé depuis .env');
} else {
    // Fallback sur account.dev.txt (compatibilité)
    try {
        const tokenPath = path.resolve(__dirname, 'account.dev.txt');
        token = fs.readFileSync(tokenPath, 'utf-8').trim();
        logger.warn('Token chargé depuis account.dev.txt (moins sécurisé)');
    } catch (error) {
        logger.error('Token non trouvé ! Vérifie .env ou account.dev.txt');
        process.exit(1);
    }
}

if (!token) {
    logger.error('Token invalide ou vide !');
    process.exit(1);
}

// ========================================
// 🚀 INITIALISATION
// ========================================

const bot = new Telegraf(token);
const app = express();
const PORT = process.env.PORT || 3000;
const URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

// ========================================
// 📊 MIDDLEWARE - STATS & LOGS
// ========================================

// Compteur de messages
let messageCount = 0;
const userStats = new Map();

bot.use(async (ctx, next) => {
    const startTime = Date.now();
    
    // Statistiques
    if (ctx.from) {
        const userId = ctx.from.id;
        if (!userStats.has(userId)) {
            userStats.set(userId, {
                firstSeen: new Date(),
                username: ctx.from.username || 'N/A',
                firstName: ctx.from.first_name || 'Anonyme',
                count: 0
            });
        }
        userStats.get(userId).count++;
        messageCount++;
    }

    // Log des messages
    if (ctx.message?.text) {
        logger.log(`📩 ${ctx.from?.first_name || 'Inconnu'} (${ctx.from?.id || '?'}): "${ctx.message.text.substring(0, 50)}${ctx.message.text.length > 50 ? '...' : ''}"`);
    }

    // Exécuter la commande
    await next();

    // Temps de réponse
    const responseTime = Date.now() - startTime;
    if (responseTime > 1000) {
        logger.warn(`⏱️ Commande lente : ${responseTime}ms`);
    }
});

// ========================================
// 🔧 COMMANDES EXISTANTES (AUTOMATIQUES)
// ========================================

const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    fs.readdirSync(commandsPath).forEach(file => {
        if (file.endsWith('.js')) {
            try {
                const command = require(path.join(commandsPath, file));
                command(bot);
                logger.success(`Commande chargée : ${file}`);
            } catch (error) {
                logger.error(`Erreur chargement ${file}: ${error.message}`);
            }
        }
    });
} else {
    logger.warn('Dossier "commands" non trouvé, création...');
    fs.mkdirSync(commandsPath, { recursive: true });
}

// ========================================
// 📋 MENU DES COMMANDES (V2)
// ========================================

bot.telegram.setMyCommands([
    { command: 'start', description: '🚀 Démarrer le bot' },
    { command: 'help', description: '📖 Afficher l\'aide' },
    { command: 'menu', description: '📋 Menu interactif' },
    { command: 'ping', description: '🏓 Vérifier le statut' },
    { command: 'stats', description: '📊 Statistiques du bot' },
    { command: 'translate', description: '🌍 Traduire un texte' },
    { command: 'imgbb', description: '🖼️ Uploader une image' },
    { command: 'getid', description: '🆔 Obtenir votre ID' },
    { command: 'ai', description: '🧠 Interroger l\'IA' },
    { command: 'about', description: 'ℹ️ À propos du bot' },
    { command: 'admin', description: '👑 Commandes admin' },
]).then(() => {
    logger.success('Menu des commandes mis à jour');
}).catch(err => {
    logger.error(`Erreur menu: ${err.message}`);
});

// ========================================
// 🌐 SERVEUR WEB
// ========================================

// Serveur statique
const publicPath = path.join(__dirname, 'public');
if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));
} else {
    fs.mkdirSync(publicPath, { recursive: true });
}

// Page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
        if (err) {
            res.send(`
                <h1>🤖 Master Charbel Bot V2</h1>
                <p>Bot en ligne !</p>
                <hr>
                <small>Version 2.0.0</small>
            `);
        }
    });
});

// Status API
app.get('/status', (req, res) => {
    res.json({
        status: 'online',
        version: '2.0.0',
        botName: config.bot_name || 'Master Charbel Bot',
        uptime: process.uptime(),
        messages: messageCount,
        users: userStats.size,
        timestamp: new Date().toISOString()
    });
});

// ========================================
// 🧠 GESTIONNAIRE DE TEXTE (IA)
// ========================================

bot.on('text', async (ctx) => {
    // Ignorer les commandes (déjà traitées)
    if (ctx.message.text.startsWith('/')) return;

    try {
        const prompt = ctx.message.text;
        
        // Appel à l'API Kaiz
        const response = await axios.get(
            `https://kaiz-apis.gleeze.com/api/gpt-4o?q=${encodeURIComponent(prompt)}&uid=${ctx.from.id}`,
            { timeout: 30000 }
        );

        if (!response.data?.response) {
            throw new Error('Réponse vide de l\'API');
        }

        const reply = response.data.response;
        
        // Envoyer par morceaux (limite Telegram)
        const parts = [];
        for (let i = 0; i < reply.length; i += 1999) {
            parts.push(reply.substring(i, i + 1999));
        }

        for (const part of parts) {
            await ctx.reply(part);
        }

    } catch (error) {
        logger.error(`Erreur IA: ${error.message}`);
        ctx.reply('❌ Désolé, une erreur est survenue avec l\'IA. Réessaie plus tard.');
    }
});

// ========================================
// 🌊 WEBHOOK & DÉMARRAGE
// ========================================

if (process.env.RENDER_EXTERNAL_URL) {
    // Mode Webhook (Render.com)
    const webhookPath = `/bot${token}`;
    bot.telegram.setWebhook(`${URL}${webhookPath}`).then(() => {
        logger.success(`Webhook configuré : ${URL}${webhookPath}`);
    }).catch(err => {
        logger.error(`Erreur webhook: ${err.message}`);
    });
    app.use(bot.webhookCallback(webhookPath));
} else {
    // Mode Polling (local)
    bot.launch().then(() => {
        logger.success('Bot démarré en mode polling (local)');
    }).catch(err => {
        logger.error(`Erreur démarrage: ${err.message}`);
    });
}

// ========================================
// 🎯 DÉMARRAGE SERVEUR
// ========================================

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║     🤖 MASTER CHARBEL BOT V2 🤖          ║
╠══════════════════════════════════════════╣
║  ✅ Statut : En ligne                     ║
║  📌 Version : 2.0.0                      ║
║  👨‍💻 Créateur : Master Charbel           ║
║  🌐 URL : ${URL.padEnd(35)}║
║  👥 Utilisateurs : ${String(userStats.size).padEnd(5)}                        ║
║  📨 Messages : ${String(messageCount).padEnd(5)}                         ║
╚══════════════════════════════════════════╝
    `);
    
    logger.success('✨ Bot prêt à servir !');
});

// ========================================
// 🛑 GESTION D'ARRÊT PROPRE
// ========================================

process.on('SIGINT', () => {
    logger.warn('Arrêt du bot (SIGINT)');
    bot.stop('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.warn('Arrêt du bot (SIGTERM)');
    bot.stop('SIGTERM');
    process.exit(0);
});

// ========================================
// 📦 EXPORTS
// ========================================

module.exports = { bot, app, logger };
