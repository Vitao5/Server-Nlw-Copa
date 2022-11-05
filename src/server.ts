import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt"

import { poolRoutes } from "./routes/pool";
import { userRoutes } from "./routes/user";
import { gameRoutes } from "./routes/game";
import { authRoutes } from "./routes/auth";
import { guessesRoutes } from "./routes/guess";

async function boostrap() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(cors, {
    origin: true,
  });

await fastify.register(jwt,{
  secret: "nlwcopa"
})

 await fastify.register(poolRoutes);
 await fastify.register(userRoutes);
 await fastify.register(gameRoutes);
 await fastify.register(authRoutes);
 await fastify.register(guessesRoutes);

 const port =  await fastify.listen({
    port: 3333,
    // host: '0.0.0.0'
  });
}

boostrap();
