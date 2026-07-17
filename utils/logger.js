// ========================================
// 📋 MASTER CHARBEL LOGGER V2
// ========================================

const chalk = require('chalk');
const moment = require('moment');

// ========================================
// 🎨 COULEURS PERSONNALISÉES
// ========================================

const colors = {
    info: chalk.blue,
    success: chalk.green,
    error: chalk.red,
    warn: chalk.yellow,
    debug: chalk.gray,
    admin: chalk.magenta,
    ai: chalk.cyan,
    database: chalk.hex('#FF6B6B'),
    webhook: chalk.hex('#4ECDC4'),
    command: chalk.hex('#FFE66D')
};

// ========================================
// 📅 FORMAT DE DATE
// ========================================

const getTimestamp = () => moment().format('HH:mm:ss');
const getFullDate = () => moment().format('DD/MM/YYYY HH:mm:ss');

// ========================================
// 🎯 FONCTIONS DE LOG
// ========================================

const logger = {
    // Log d'information
    info: (message, ...args) => {
        console.log(`${colors.info('ℹ️')} [${getTimestamp()}] ${colors.info(message)}`, ...args);
    },

    // Log de succès
    success: (message, ...args) => {
        console.log(`${colors.success('✅')} [${getTimestamp()}] ${colors.success(message)}`, ...args);
    },

    // Log d'erreur
    error: (message, ...args) => {
        console.error(`${colors.error('❌')} [${getTimestamp()}] ${colors.error(message)}`, ...args);
    },

    // Log d'avertissement
    warn: (message, ...args) => {
        console.warn(`${colors.warn('⚠️')} [${getTimestamp()}] ${colors.warn(message)}`, ...args);
    },

    // Log de débogage
    debug: (message, ...args) => {
        if (process.env.DEBUG === 'true') {
            console.log(`${colors.debug('🐛')} [${getTimestamp()}] ${colors.debug(message)}`, ...args);
        }
    },

    // Log administrateur
    admin: (message, ...args) => {
        console.log(`${colors.admin('👑')} [${getTimestamp()}] ${colors.admin(message)}`, ...args);
    },

    // Log IA
    ai: (message, ...args) => {
        console.log(`${colors.ai('🧠')} [${getTimestamp()}] ${colors.ai(message)}`, ...args);
    },

    // Log base de données
    database: (message, ...args) => {
        console.log(`${colors.database('💾')} [${getTimestamp()}] ${colors.database(message)}`, ...args);
    },

    // Log webhook
    webhook: (message, ...args) => {
        console.log(`${colors.webhook('🌐')} [${getTimestamp()}] ${colors.webhook(message)}`, ...args);
    },

    // Log commande
    command: (message, ...args) => {
        console.log(`${colors.command('⌨️')} [${getTimestamp()}] ${colors.command(message)}`, ...args);
    },

    // ========================================
    // 📊 LOG AVANCÉS
    // ========================================

    // Log d'un message utilisateur
    userMessage: (ctx, message) => {
        const user = ctx.from;
        const preview = message.substring(0, 50);
        const suffix = message.length > 50 ? '...' : '';
        console.log(
            `${colors.info('📩')} [${getTimestamp()}] ` +
            `${colors.cyan(user.first_name || 'Inconnu')} ` +
            `(${colors.gray(user.id)})` +
            `${colors.gray(`: "${preview}${suffix}"`)}`
        );
    },

    // Log de commande utilisateur
    userCommand: (ctx, command) => {
        const user = ctx.from;
        console.log(
            `${colors.command('⌨️')} [${getTimestamp()}] ` +
            `${colors.cyan(user.first_name || 'Inconnu')} ` +
            `(${colors.gray(user.id)})` +
            `${colors.gray(` a exécuté /${command}`)}`
        );
    },

    // Log de nouveau utilisateur
    newUser: (ctx) => {
        const user = ctx.from;
        console.log(
            `${colors.success('👤')} [${getTimestamp()}] ` +
            `${colors.green('Nouvel utilisateur')} : ` +
            `${colors.cyan(user.first_name || 'Inconnu')} ` +
            `(${colors.gray(user.id)})` +
            `${user.username ? ` @${colors.yellow(user.username)}` : ''}`
        );
    },

    // Log de démarrage
    startup: () => {
        console.log('\n' + '='.repeat(60));
        console.log(
            colors.success('🚀 ') +
            colors.bold('MASTER CHARBEL BOT V2') +
            colors.gray(' - DÉMARRAGE')
        );
        console.log('='.repeat(60));
        console.log(
            `${colors.info('📌')} Version      : ${colors.cyan('2.0.0')}`
        );
        console.log(
            `${colors.info('📅')} Date         : ${colors.cyan(getFullDate())}`
        );
        console.log(
            `${colors.info('🖥️')} Environnement : ${colors.cyan(process.env.NODE_ENV || 'development')}`
        );
        console.log('='.repeat(60) + '\n');
    },

    // Log d'arrêt
    shutdown: (signal) => {
        console.log('\n' + '='.repeat(60));
        console.log(
            colors.warn('🛑 ') +
            colors.bold('ARRÊT DU BOT') +
            colors.gray(` (${signal})`)
        );
        console.log('='.repeat(60));
        console.log(
            `${colors.info('📅')} Arrêt à : ${colors.cyan(getFullDate())}`
        );
        console.log('='.repeat(60) + '\n');
    },

    // ========================================
    // 📈 STATISTIQUES
    // ========================================

    stats: (stats) => {
        console.log('\n' + '='.repeat(60));
        console.log(
            colors.info('📊 ') +
            colors.bold('STATISTIQUES EN TEMPS RÉEL')
        );
        console.log('='.repeat(60));
        console.log(
            `${colors.info('👥')} Utilisateurs : ${colors.cyan(stats.users || 0)}`
        );
        console.log(
            `${colors.info('📨')} Messages    : ${colors.cyan(stats.messages || 0)}`
        );
        console.log(
            `${colors.info('⏱️')} Uptime      : ${colors.cyan(stats.uptime || 'N/A')}`
        );
        console.log(
            `${colors.info('💾')} Mémoire     : ${colors.cyan(stats.memory || 'N/A')}`
        );
        console.log('='.repeat(60) + '\n');
    },

    // ========================================
    // 🎨 DIVISEURS
    // ========================================

    separator: (char = '=', length = 60) => {
        console.log(colors.gray(char.repeat(length)));
    },

    title: (title) => {
        console.log('\n' + colors.bold.cyan(`📌 ${title}`));
        console.log(colors.gray('─'.repeat(title.length + 4)));
    },

    // ========================================
    // 🔄 COMPATIBILITÉ AVEC L'ANCIENNE VERSION
    // ========================================

    // Ancienne fonction log (pour compatibilité)
    log: (message) => {
        console.log(`[LOG] ${message}`);
    },

    // Ancienne fonction error (pour compatibilité)
    errorLegacy: (message) => {
        console.error(`[ERREUR] ${message}`);
    }
};

// ========================================
// 📦 EXPORT
// ========================================

module.exports = logger;
