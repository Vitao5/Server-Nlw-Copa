import { PrismaClient } from '@prisma/client';

//realiza a conexão com o banco de dados
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.create({
        data: {
            name: 'Vitão',
            email: 'vitinmoreira1908@gmail.com',
            avatarUrl: 'https://github.com/Vitao5.png'
        }
    })

    const pool = await prisma.pool.create({
        data: {
            title: 'Bolão do Zé perna de pau',
            code: 'BL2022',
            ownerId: user.id,

            participants:{
                create: {
                    userId: user.id
                }
            }
        }
    })

    await prisma.game.create({
        data:{
            date: '2022-11-02T20:06:33.534Z',
            firstTeamCountryCode: 'DE',
            secondTeamCountryCode: 'BR'
        }
    })

    await prisma.game.create({
        data:{
            date: '2022-12-02T20:06:33.534Z',
            firstTeamCountryCode: 'BR',
            secondTeamCountryCode: 'AR',

            guess:{
               create:{
                firstTeamPoints: 2,
                secondTeamPoints: 0,

                participant: {
                    connect:{
                        userId_poolId:{
                            userId: user.id,
                            poolId: pool.id
                        }
                    }
                }
               }
            }
        }
    })
}

main()