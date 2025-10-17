-- DropIndex
DROP INDEX "public"."Todo_createdAt_idx";

-- DropIndex
DROP INDEX "public"."Todo_nameId_idx";

-- DropIndex
DROP INDEX "public"."Todo_priority_idx";

-- DropIndex
DROP INDEX "public"."Todo_userId_idx";

-- CreateIndex
CREATE INDEX "Todo_userId_priority_createdAt_idx" ON "Todo"("userId", "priority", "createdAt");

-- CreateIndex
CREATE INDEX "Todo_userId_nameId_idx" ON "Todo"("userId", "nameId");

-- CreateIndex
CREATE INDEX "Todo_userId_createdAt_idx" ON "Todo"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Todo_userId_completed_idx" ON "Todo"("userId", "completed");
