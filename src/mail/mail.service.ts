// mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Enviar email para restablecer contraseña de usuarios existentes
   */
  async sendResetPasswordEmail(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Restablecer contraseña',
      template: 'reset-password',
      context: { url },
    });

    console.log(`📧 Email de restablecimiento enviado a ${email}: ${url}`);
  }

  /**
   * Restablecer contraseña sin token (desde url publica)
   */
  async sendUserInvitation(email: string, token: string) {
  // 🔍 DEBUG: Ver qué recibe el MailService
  console.log('🔍 MailService - Token recibido:', {
    token: token,
    length: token.length,
    containsHttp: token.includes('http'),
    containsLocalhost: token.includes('localhost'),
    first100Chars: token.substring(0, 100) + '...'
  });

  // Si el token ya es una URL completa, extraer solo el token JWT
  let cleanToken = token;
  if (token.includes('http') && token.includes('token=')) {
    console.warn('⚠️  PROBLEMA: El token recibido contiene URL completa');
    try {
      const url = new URL(token);
      cleanToken = url.searchParams.get('token') || token;
      console.log('🔍 MailService - Token extraído:', cleanToken);
    } catch (e) {
      console.error('❌ Error parseando URL:', e.message);
      // Fallback: extraer manualmente
      const match = token.match(/token=([^&]+)/);
      if (match) {
        cleanToken = match[1];
        console.log('🔍 MailService - Token extraído (fallback):', cleanToken);
      }
    }
  }

  const url = `${process.env.FRONTEND_URL}/set-password?token=${cleanToken}`;
  console.log('🔍 MailService - URL final construida:', url);

  await this.mailerService.sendMail({
    to: email,
    subject: 'Invitación para unirte a nuestra plataforma',
    template: 'user-invitation',
    context: { url, appName: 'Iglesia Platform' },
  });

  console.log(`📧 Invitación enviada a ${email}`);
}


async sendPasswordReset(email: string, resetUrl: string) {
  const subject = 'Recuperación de contraseña - ICED';
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Recupera tu contraseña</h2>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
      <a href="${resetUrl}"
         style="display:inline-block;background:#1E88E5;color:white;padding:10px 20px;
                border-radius:8px;text-decoration:none;margin-top:10px;">
        Restablecer contraseña
      </a>
      <p style="margin-top:20px;font-size:0.9em;color:#555;">
        Si no solicitaste este cambio, ignora este correo.
      </p>
    </div>
  `;

  await this.mailerService.sendMail({
    to: email,
    subject,
    html,
  });

  console.log(`📧 Email de recuperación de contraseña enviado a ${email}: ${resetUrl}`);
}


}
