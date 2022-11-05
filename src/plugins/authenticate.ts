import {FastifyRequest} from "fastify"


export default async function authenticate(request: FastifyRequest){
    await request.jwtVerify()
}