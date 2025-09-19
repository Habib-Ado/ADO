const nodemailer = require('nodemailer');

// Configurazione del trasportatore email (Gmail per esempio)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'votre-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'votre-mot-de-passe-app'
    }
});

// Configurazione dei template d'email
const emailTemplates = {
    verification: {
        subject: 'Verifica del tuo account - Artigianato on Ligne',
        html: (username, verificationLink) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                    <h1 style="color: #343a40; margin: 0;">🎨 Artigianato on Ligne</h1>
                </div>
                <div style="padding: 20px; background-color: white;">
                    <h2 style="color: #495057;">Bonjour ${username} !</h2>
                    <p>Grazie per esserti registrato sul nostro sito web d'artigianato en ligne.</p>
                    <p>Per attivare il tuo account e iniziare a fare acquisti, clicca sul pulsante qui sotto :</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                           style="background-color: #007bff; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Verifica il tuo account
                        </a>
                    </div>
                    <p>Se il pulsante non funziona, puoi copiare e incollare questo link nel tuo browser :</p>
                    <p style="word-break: break-all; color: #6c757d;">${verificationLink}</p>
                    <p>Questo link scadrà entro 24 ore.</p>
                    <p>Cordialemente,<br>L'equipa Artigianato on Ligne</p>
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d;">
                    <p>Se non hai creato un account, ignora questo email.</p>
                </div>
            </div>
        `
    },
    welcome: {
        subject: 'Benvenuto su Artigianato on Ligne!',
        html: (username) => `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                    <h1 style="color: #343a40; margin: 0;">🎨 Artigianato on Ligne</h1>
                </div>
                <div style="padding: 20px; background-color: white;">
                    <h2 style="color: #495057;">Bienvenue ${username} !</h2>
                    <p>Il tuo account è stato verificato con successo!</p>
                    <p>Ora puoi:</p>
                    <ul style="color: #495057;">
                        <li>Sfogliare la nostra collezione d'artigianato unico</li>
                        <li>Fare acquisti in sicurezza</li>
                        <li>Contattare direttamente gli artigiani</li>
                        <li>Lasciare recensioni sui tuoi acquisti</li>
                    </ul>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3021'}" 
                           style="background-color: #28a745; color: white; padding: 12px 30px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Iniziare a fare acquisti
                        </a>
                    </div>
                    <p>Cordialemente,<br>L'equipa Artigianato on Ligne</p>
                </div>
            </div>
        `
    }
};

// Funzione per inviare un'email
const sendEmail = async (to, template, data) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@artigianato.com',
            to: to,
            subject: template.subject,
            html: template.html(...data)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email inviata:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Errore durante l\'invio dell\'email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    transporter,
    emailTemplates,
    sendEmail
}; 