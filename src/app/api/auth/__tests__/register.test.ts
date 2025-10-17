import { NextRequest } from 'next/server'
import { POST } from '../register/route'
import { prisma } from '@/lib/prisma'
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    token: {
      create: jest.fn(),
    },
  },
}))
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}))
jest.mock('@/lib/email', () => ({
  sendConfirmationEmail: jest.fn().mockResolvedValue(true),
}))
describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('deve criar um novo usuário com dados válidos', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      password: 'hashed_password',
      isConfirmed: false,
      createdAt: new Date(),
    }
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
  password: 'ValidPass123!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(prisma.user.create).toHaveBeenCalled()
  })
  it('deve retornar erro 400 para email inválido', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
  password: 'ValidPass123!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.ok).toBe(false)
  })
  it('deve retornar erro 400 para senha curta', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: '123',
      }),
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.ok).toBe(false)
  })
  it('deve retornar erro 400 para email já cadastrado', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '123',
      email: 'test@example.com',
    })
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
  password: 'ValidPass123!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data.ok).toBe(false)
    expect(data.error).toContain('Email já cadastrado')
  })
  it('deve auto-confirmar usuário quando TESTSPRITE_AUTO_CONFIRM=true', async () => {
    process.env.TESTSPRITE_AUTO_CONFIRM = 'true'
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      password: 'hashed_password',
      isConfirmed: false,
      createdAt: new Date(),
    }
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(prisma.user.create as jest.Mock).mockResolvedValue(mockUser)
    ;(prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, isConfirmed: true })
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
  password: 'ValidPass123!',
      }),
    })
    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: { isConfirmed: true },
    })
  })
})