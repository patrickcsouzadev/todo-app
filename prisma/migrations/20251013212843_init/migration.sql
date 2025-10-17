CREATE TYPE "Priority" AS ENUM ('RED', 'YELLOW', 'BLUE');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Name" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Name_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "linkImage" TEXT,
    "priority" "Priority" NOT NULL,
    "nameId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE INDEX "User_email_idx" ON "User"("email");

CREATE INDEX "Name_userId_idx" ON "Name"("userId");

CREATE INDEX "Todo_userId_idx" ON "Todo"("userId");

CREATE INDEX "Todo_nameId_idx" ON "Todo"("nameId");

CREATE INDEX "Todo_priority_idx" ON "Todo"("priority");

CREATE INDEX "Todo_createdAt_idx" ON "Todo"("createdAt");

CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

CREATE INDEX "Token_token_idx" ON "Token"("token");

CREATE INDEX "Token_userId_idx" ON "Token"("userId");

ALTER TABLE "Name" ADD CONSTRAINT "Name_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Todo" ADD CONSTRAINT "Todo_nameId_fkey" FOREIGN KEY ("nameId") REFERENCES "Name"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
