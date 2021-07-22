import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['query'] })
// prisma.user
//    .create({ data: { email: 'a@b.com' } })
//    .then(console.log)
//    .catch(console.error)

export default prisma
