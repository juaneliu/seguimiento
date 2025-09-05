-- CreateTable
CREATE TABLE "oficios_seguimiento" (
    "id" SERIAL NOT NULL,
    "enteId" INTEGER NOT NULL,
    "sistema" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "urlPdf" TEXT NOT NULL,
    "fechaOficio" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creadoPor" TEXT,

    CONSTRAINT "oficios_seguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "oficios_seguimiento_enteId_idx" ON "oficios_seguimiento"("enteId");

-- CreateIndex
CREATE INDEX "oficios_seguimiento_sistema_idx" ON "oficios_seguimiento"("sistema");

-- AddForeignKey
ALTER TABLE "oficios_seguimiento" ADD CONSTRAINT "oficios_seguimiento_enteId_fkey" FOREIGN KEY ("enteId") REFERENCES "entes_publicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
