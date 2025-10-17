import '@testing-library/jest-dom'
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/todoapp_test?schema=public'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only'
process.env.TESTSPRITE_AUTO_CONFIRM = 'true'