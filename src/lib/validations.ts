import { z } from 'zod'
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(12, 'Senha deve ter no mínimo 12 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial')
    .refine(password => {
      const commonSequences = ['123', 'abc', 'qwe', 'asd', 'password', 'senha']
      return !commonSequences.some(seq => password.toLowerCase().includes(seq))
    }, 'Senha não pode conter sequências comuns'),
})
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})
export const requestResetSchema = z.object({
  email: z.string().email('Email inválido'),
})
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  newPassword: z
    .string()
    .min(12, 'Senha deve ter no mínimo 12 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Senha deve conter pelo menos um caractere especial')
    .refine(password => {
      const commonSequences = ['123', 'abc', 'qwe', 'asd', 'password', 'senha']
      return !commonSequences.some(seq => password.toLowerCase().includes(seq))
    }, 'Senha não pode conter sequências comuns'),
})
export const nameSchema = z.object({
  label: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome muito longo'),
})
const todoBaseSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(150, 'Título muito longo'),
  description: z.string().max(500, 'Descrição muito longa (máx 500 caracteres)').optional(),
  link: z.string()
    .url('URL inválida')
    .max(2048, 'URL muito longa')
    .refine(url => {
      try {
        const urlObj = new URL(url)
        return ['http:', 'https:'].includes(urlObj.protocol)
      } catch {
        return false
      }
    }, 'Apenas URLs HTTP e HTTPS são permitidas')
    .refine(url => {
      try {
        const urlObj = new URL(url)
        const blockedDomains = ['localhost', '127.0.0.1', '0.0.0.0']
        return !blockedDomains.includes(urlObj.hostname.toLowerCase())
      } catch {
        return false
      }
    }, 'Domínios bloqueados não são permitidos')
    .optional().or(z.literal('')),
  priority: z.enum(['RED', 'YELLOW', 'BLUE'], {
    errorMap: () => ({ message: 'Prioridade inválida' }),
  }),
  nameId: z.string().uuid('ID do nome inválido').optional().nullable(),
})
export const todoSchema = todoBaseSchema.refine(data => {
  const size = JSON.stringify(data).length
  return size < 10000
}, { message: 'Payload muito grande (máx 10KB)' })
export const updateTodoSchema = todoBaseSchema.partial().refine(data => {
  const size = JSON.stringify(data).length
  return size < 10000
}, { message: 'Payload muito grande (máx 10KB)' })
export const todoFiltersSchema = z.object({
  priority: z.string().optional(),
  nameId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sort: z.enum(['createdAt_asc', 'createdAt_desc', 'priority']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})