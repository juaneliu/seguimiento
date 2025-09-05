-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "tabla" TEXT NOT NULL,
    "registroId" INTEGER,
    "datosAnteriores" JSONB,
    "datosNuevos" JSONB,
    "direccionIP" TEXT,
    "userAgent" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_usuarioId_idx" ON "audit_logs"("usuarioId");
CREATE INDEX "audit_logs_tabla_idx" ON "audit_logs"("tabla");
CREATE INDEX "audit_logs_accion_idx" ON "audit_logs"("accion");
CREATE INDEX "audit_logs_fechaCreacion_idx" ON "audit_logs"("fechaCreacion");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
