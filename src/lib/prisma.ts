import { PrismaClient } from "@prisma/client";

//realiza a coneão com o banco de dados
export const prisma = new PrismaClient({
    log: ['query'],
})