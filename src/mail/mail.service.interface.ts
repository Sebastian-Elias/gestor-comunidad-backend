// src/mail/mail.service.interface.ts
export interface MailService {
  sendUserInvitation(params: { email: string; url: string }): Promise<void>;
  
}