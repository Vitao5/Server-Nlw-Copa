import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import ShortUniqueId from "short-unique-id";
import authenticate from "../plugins/authenticate";

export async function poolRoutes(fastify: FastifyInstance) {
  //retorna a contagem de bolões
  fastify.get("/pools/count", async () => {
    const count = await prisma.pool.count();
    return { count };
  });

  //realiza a criação de um bolão
  fastify.post("/pools", async (request, reply) => {
    const createPoolBody = z.object({
      title: z.string(),
    });
    const { title } = createPoolBody.parse(request.body);

    const generate = new ShortUniqueId({ length: 6 });
    const code = String(generate()).toUpperCase();


    try{
      await request.jwtVerify()

      await prisma.pool.create({
        data: {
          title,
          code,
          ownerId: request.user.sub,
           participants:{
            create:{
              userId: request.user.sub
            }
           }
        },
      });
    }
    catch{
      await prisma.pool.create({
        data: {
          title,
          code,
        },
      });
    }



    return reply.status(201).send({ code });
  });

  //entra em um bolão
  fastify.post("/pools/join",{
    onRequest: [authenticate],
  },async (request, replay)=>{
    const joinPoolBody = z.object({
      code: z.string(),
    });

    const {code} = joinPoolBody.parse(request.body)

    const pool = await prisma.pool.findUnique({
      where:{
        code
      },
      include:{
        participants:{
          where:{
            userId: request.user.sub
          }
        }
      }
    })

    if(!pool){
      return replay.status(404).send({
        message: 'Bolão não encontrado. Verifique o código digitado',
        title: 'Error',
        status: 404
      })
    }

    if(!pool.ownerId){
      await prisma.pool.update({
        where:{
          id: pool.id
        },
        data:{
          ownerId: request.user.sub
        }
      })
    }

    if(pool.participants.length > 0){
      return replay.status(401).send({
        message: 'Não é possível entrar no mesmo bolão duas vezes.',
        title: 'Error',
        status: 401
      })
    }

    await prisma.participant.create({
      data:{
        poolId: pool.id,
        userId: request.user.sub
      }
    })
    return replay.status(201).send()
  })

  //busca todos os bolões que o usuário participando
  fastify.get("/pools",{
    onRequest: [authenticate],
  }, async (request)=>{
    const pools = await prisma.pool.findMany({
      where:{
        participants:{
          some:{
            userId: request.user.sub
          }
        }
      },
      include:{
        _count:{
          select:{
            participants: true
          }
        },
        participants:{
          select:{
            id: true,
            user:{
              select:{
                avatarUrl: true,
              }
            }
          },
          take: 4
        },
        owner: {
          select:{
            name: true,
            avatarUrl: true,
            id: true
          }
        },
      },
    })
    return {pools}
  })

  //tras todos os detalhes do bolão
  fastify.get("/pools/:id",{
    onRequest: [authenticate],
  }, async (request)=>{
    const getPoolParams = z.object({
      id: z.string()
    })
    const {id} = getPoolParams.parse(request.params)
    const pool = await prisma.pool.findUnique({
      where:{
       id
      },
      include:{
        _count:{
          select:{
            participants: true
          }
        },
        participants:{
          select:{
            id: true,
            user:{
              select:{
                avatarUrl: true,
              }
            }
          },
          take: 4
        },
        owner: {
          select:{
            name: true,
            avatarUrl: true,
            id: true
          }
        },
      },
    })
    return {pool}
  })
}
