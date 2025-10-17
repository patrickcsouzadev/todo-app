import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import crypto from 'crypto'

export interface MFASetupResult {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface MFACode {
  code: string
  backupCode?: boolean
}

export function generateMFASecret(): string {
  return speakeasy.generateSecret({
    name: 'Todo App',
    issuer: 'Todo App Security',
    length: 32
  }).base32
}

export function generateBackupCodes(): string[] {
  const codes: string[] = []
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase())
  }
  return codes
}

export function verifyTOTPCode(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2
  })
}

export function generateQRCodeUrl(secret: string, userEmail: string): string {
  const otpauthUrl = speakeasy.otpauthURL({
    secret,
    label: userEmail,
    issuer: 'Todo App',
    algorithm: 'sha1',
    digits: 6,
    period: 30
  })
  
  return otpauthUrl
}

export async function generateQRCodeBase64(secret: string, userEmail: string): Promise<string> {
  const otpauthUrl = generateQRCodeUrl(secret, userEmail)
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    
    return qrCodeDataUrl
  } catch (error) {
    throw new Error('Failed to generate QR code')
  }
}

export function verifyBackupCode(providedCode: string, backupCodes: string[]): boolean {
  const normalizedCode = providedCode.toUpperCase().replace(/\s/g, '')
  return backupCodes.includes(normalizedCode)
}

export function removeUsedBackupCode(providedCode: string, backupCodes: string[]): string[] {
  const normalizedCode = providedCode.toUpperCase().replace(/\s/g, '')
  return backupCodes.filter(code => code !== normalizedCode)
}

export function validateMFAFormat(code: string): boolean {
  if (/^\d{6}$/.test(code)) return true
  
  if (/^[A-F0-9]{8}$/i.test(code.replace(/\s/g, ''))) return true
  
  return false
}

export function setupMFA(userEmail: string): MFASetupResult {
  const secret = generateMFASecret()
  const backupCodes = generateBackupCodes()
  
  return {
    secret,
    qrCodeUrl: generateQRCodeUrl(secret, userEmail),
    backupCodes
  }
}

export function verifyMFACode(
  secret: string, 
  code: string, 
  backupCodes: string[]
): { valid: boolean; isBackupCode: boolean; updatedBackupCodes?: string[] } {
  
  if (!validateMFAFormat(code)) {
    return { valid: false, isBackupCode: false }
  }
  
  if (/^\d{6}$/.test(code)) {
    const valid = verifyTOTPCode(secret, code)
    return { valid, isBackupCode: false }
  }
  
  const normalizedCode = code.toUpperCase().replace(/\s/g, '')
  const isBackupCode = verifyBackupCode(normalizedCode, backupCodes)
  
  if (isBackupCode) {
    const updatedBackupCodes = removeUsedBackupCode(normalizedCode, backupCodes)
    return { 
      valid: true, 
      isBackupCode: true, 
      updatedBackupCodes 
    }
  }
  
  return { valid: false, isBackupCode: false }
}



