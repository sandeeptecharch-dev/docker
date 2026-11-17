# Docker Compose Hands-on Practice: E-commerce Microservices

A practical lab for learning Docker Compose by running two Node.js
microservices and MongoDB.

## What you will build

-   **User Service** (`user-service`): creates and retrieves users.
-   **Order Service** (`order-service`): verifies a user by calling User
    Service, then creates orders.
-   **MongoDB** (`mongodb`): stores users and orders in the `ecommerce`
    database.
-   **Docker network**: allows containers to communicate using Compose
    service names.
-   **Named volume**: persists MongoDB data when containers are removed
    and recreated.

### Request flow

``` text
Client
  |
  +---- POST /users ----------------> User Service :3001
  |                                      |
  |                                      +---- MongoDB
  |
  +---- POST /orders/:userId -------> Order Service :3002
                                         |
                                         +---- HTTP request to
                                         |     http://user-service:3001
                                         |
                                         +---- MongoDB
```

> Important: `localhost` inside a container means that same container.
> From Order Service, use `http://user-service:3001`, not
> `http://localhost:3001`.

## 1. Prerequisites

-   Docker Engine or Docker Desktop with the Docker Compose plugin.
-   A terminal such as Ubuntu/WSL.
-   `curl` for API testing (or Postman).

Check installation:

``` bash
docker --version
docker compose version
docker info
```

Use the modern command `docker compose` (with a space), not the legacy
`docker-compose` command.

## 2. Project structure

Create this structure:

``` text
ecommerce-microservices/
├── compose.yaml
├── user-service/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
└── order-service/
    ├── Dockerfile
    ├── package.json
    └── server.js
```

Create the folders:

``` bash
mkdir -p ecommerce-microservices/user-service ecommerce-microservices/order-service
cd ecommerce-microservices
```

## 3. Create User Service

### `user-service/package.json`

``` json
{
  "name": "user-service",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^5.1.0",
    "mongodb": "^6.20.0"
  }
}
```

### `user-service/server.js`

``` javascript
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = 3001;
const client = new MongoClient(process.env.MONGO_URL);

let usersCollection;

async function startServer() {
  await client.connect();

  const db = client.db("ecommerce");
  usersCollection = db.collection("users");

  console.log("User Service connected to MongoDB");

  app.post("/users", async (req, res) => {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({ error: "name and email are required" });
      }

      const result = await usersCollection.insertOne({ name, email });

      res.status(201).json({
        message: "User created successfully",
        userId: result.insertedId
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/users/:id", async (req, res) => {
    try {
      if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const user = await usersCollection.findOne({
        _id: new ObjectId(req.params.id)
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`User Service listening on ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("User Service startup failed:", error);
  process.exit(1);
});
```

### `user-service/Dockerfile`

``` dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

## 4. Create Order Service

### `order-service/package.json`

``` json
{
  "name": "order-service",
  "version": "1.0.0",
  "main": "server.js",
  "dependencies": {
    "express": "^5.1.0",
    "mongodb": "^6.20.0"
  }
}
```

### `order-service/server.js`

``` javascript
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());

const PORT = 3002;
const client = new MongoClient(process.env.MONGO_URL);

let ordersCollection;

async function startServer() {
  await client.connect();

  const db = client.db("ecommerce");
  ordersCollection = db.collection("orders");

  console.log("Order Service connected to MongoDB");

  app.post("/orders/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { product, amount } = req.body;

      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      if (!product || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({
          error: "product and a positive numeric amount are required"
        });
      }

      // Compose DNS resolves "user-service" to the User Service container.
      const response = await fetch(
        `http://user-service:3001/users/${userId}`
      );

      if (!response.ok) {
        return res.status(response.status).json({
          error: "User verification failed"
        });
      }

      const user = await response.json();

      const result = await ordersCollection.insertOne({
        userId: new ObjectId(userId),
        userName: user.name,
        product,
        amount,
        createdAt: new Date()
      });

      res.status(201).json({
        message: "Order created successfully",
        orderId: result.insertedId,
        customer: user.name
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/orders", async (req, res) => {
    try {
      const orders = await ordersCollection.find().toArray();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Order Service listening on ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Order Service startup failed:", error);
  process.exit(1);
});
```

### `order-service/Dockerfile`

``` dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3002
CMD ["node", "server.js"]
```

## 5. Create Docker Compose configuration

### `compose.yaml`

``` yaml
services:
  user-service:
    build: ./user-service
    ports:
      - "3001:3001"
    environment:
      MONGO_URL: mongodb://mongodb:27017/ecommerce
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - ecommerce-network
    restart: unless-stopped

  order-service:
    build: ./order-service
    ports:
      - "3002:3002"
    environment:
      MONGO_URL: mongodb://mongodb:27017/ecommerce
    depends_on:
      mongodb:
        condition: service_healthy
      user-service:
        condition: service_started
    networks:
      - ecommerce-network
    restart: unless-stopped

  mongodb:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
    healthcheck:
      test: ["CMD", "mongosh", "--quiet", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s
    networks:
      - ecommerce-network
    restart: unless-stopped

networks:
  ecommerce-network:
    driver: bridge

volumes:
  mongo-data:
```

Notes:

-   Compose creates a project-scoped network and volume.
-   `mongodb` is the hostname used by both Node.js services to reach
    MongoDB.
-   `depends_on` with `service_healthy` waits for MongoDB's health
    check.
-   `service_started` does not guarantee that User Service is ready to
    handle requests. For a more robust production setup, add an
    application health endpoint and health check, and implement
    retry/backoff for service-to-service calls.
-   No fixed `container_name` is used. This avoids name conflicts and
    lets Compose generate project-scoped names.

## 6. Validate and start the application

Run these commands from the directory containing `compose.yaml`.

### Validate Compose YAML

``` bash
docker compose config
```

### Build images and start containers

``` bash
docker compose up -d --build
```

### Check service status

``` bash
docker compose ps
```

### Follow logs from all services

``` bash
docker compose logs -f
```

Press `Ctrl+C` to stop following logs; this does not stop the
containers.

### Follow logs for one service

``` bash
docker compose logs -f user-service
docker compose logs -f order-service
docker compose logs -f mongodb
```

## 7. Test the APIs

The following examples use `curl`. Run them from your host machine, not
inside a container.

### Create a user

``` bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Sandeep","email":"sandeep@example.com"}'
```

Example response (the ObjectId will be different):

``` json
{
  "message": "User created successfully",
  "userId": "673abc123456789012345678"
}
```

Copy the actual `userId` from your response.

### Retrieve the user

Replace `USER_ID` with the actual ID:

``` bash
curl http://localhost:3001/users/USER_ID
```

### Create an order

Replace `USER_ID` with the same actual ID:

``` bash
curl -X POST http://localhost:3002/orders/USER_ID \
  -H "Content-Type: application/json" \
  -d '{"product":"Laptop","amount":85000}'
```

Order Service calls `http://user-service:3001/users/USER_ID` from inside
its container. If the user exists, it saves the order in MongoDB.

### List orders

``` bash
curl http://localhost:3002/orders
```

### Test an invalid user ID

``` bash
curl -i -X POST http://localhost:3002/orders/000000000000000000000000 \
  -H "Content-Type: application/json" \
  -d '{"product":"Laptop","amount":85000}'
```

Expected: a user-not-found response (404).

## 8. Docker Compose commands to practice

Run commands from the project directory unless otherwise stated.

  ----------------------------------------------------------------------------
  Command                                  Purpose
  ---------------------------------------- -----------------------------------
  `docker compose config`                  Validate and render Compose
                                           configuration

  `docker compose up -d`                   Create/start services in detached
                                           mode

  `docker compose up -d --build`           Build/rebuild images and start
                                           services

  `docker compose down`                    Stop and remove project containers
                                           and network

  `docker compose ps`                      Show project containers and status

  `docker compose ps -a`                   Include stopped project containers

  `docker compose logs`                    Show service logs

  `docker compose logs -f`                 Follow logs continuously

  `docker compose logs -f user-service`    Follow one service's logs

  `docker compose stop user-service`       Stop one service

  `docker compose start user-service`      Start a stopped service

  `docker compose restart order-service`   Restart one service

  `docker compose exec order-service sh`   Open a shell in a running container

  `docker compose exec mongodb mongosh`    Open MongoDB shell

  `docker compose build`                   Build configured images

  `docker compose pull`                    Pull configured images

  `docker compose images`                  List images used by the project

  `docker compose top`                     Show processes in service
                                           containers

  `docker compose down -v`                 Remove containers, network, and
                                           Compose-managed named volumes
  ----------------------------------------------------------------------------

**Warning:** `docker compose down -v` deletes the MongoDB named volume
and its stored lab data. Use it only when you intentionally want a clean
reset.

## 9. Explore Docker networking

### List Docker networks

``` bash
docker network ls
```

### Inspect the Compose network

The network name is usually `<project-directory>_ecommerce-network`.
Find its exact name with `docker network ls`, then run:

``` bash
docker network inspect ecommerce-microservices_ecommerce-network
```

If your project directory has a different name, replace the network name
accordingly.

### Test service-to-service communication from Order Service

``` bash
docker compose exec order-service sh
```

Inside the container:

``` sh
wget -qO- http://user-service:3001/
```

The root path `/` is not implemented in this lab, so an HTTP 404 is
possible and does not by itself indicate a network failure. Test a real
endpoint instead, replacing `USER_ID` with a valid ID:

``` sh
wget -qO- http://user-service:3001/users/USER_ID
```

Exit the container shell:

``` sh
exit
```

### Key networking lesson

-   From your host: `http://localhost:3001`
-   From Order Service container: `http://user-service:3001`
-   From either Node.js service to MongoDB:
    `mongodb://mongodb:27017/ecommerce`

Container-to-container traffic uses the container port, not the
host-published port.

## 10. Explore MongoDB and persistent volumes

### List volumes

``` bash
docker volume ls
```

### Inspect the Compose volume

The volume name is usually `<project-directory>_mongo-data`:

``` bash
docker volume inspect ecommerce-microservices_mongo-data
```

Use the actual name shown by `docker volume ls` if it differs.

### Open MongoDB shell

``` bash
docker compose exec mongodb mongosh
```

Inside `mongosh`:

``` javascript
show dbs
use ecommerce
show collections
db.users.find().pretty()
db.orders.find().pretty()
exit
```

### Prove persistence

1.  Create a user and an order.
2.  Run `docker compose down`.
3.  Run `docker compose up -d`.
4.  Call `curl http://localhost:3002/orders` again.

Your data should still exist because `docker compose down` keeps named
volumes by default.

Do not use `docker compose down -v` for this persistence test.

## 11. Practice container lifecycle and failure scenarios

### Stop User Service

``` bash
docker compose stop user-service
docker compose ps
```

Try creating an order while User Service is stopped. The request should
fail because Order Service cannot verify the user.

### Start User Service again

``` bash
docker compose start user-service
docker compose ps
```

Retry the order request.

### Restart Order Service

``` bash
docker compose restart order-service
```

### Rebuild after changing application code

``` bash
docker compose up -d --build user-service
```

If you change Order Service instead:

``` bash
docker compose up -d --build order-service
```

## 12. Troubleshooting

### Error: container name already in use

This often happens when a fixed `container_name` is reused by another
container.

Check:

``` bash
docker ps -a
docker ps -a --filter name=user-service
```

If you have confirmed that the old container is not needed, remove it:

``` bash
docker rm -f user-service
```

Prefer omitting `container_name` from Compose files so Compose can
generate unique project-scoped names.

### Service is not starting

``` bash
docker compose ps -a
docker compose logs user-service
docker compose logs order-service
docker compose logs mongodb
```

### Port is already allocated

Check which process is using the port. On Linux/WSL:

``` bash
sudo ss -ltnp | grep -E ':3001|:3002'
```

Stop the conflicting process or change the host side of the port
mapping. For example, `"3011:3001"` maps host port 3011 to container
port 3001.

### Recreate the application

``` bash
docker compose down
docker compose up -d --build
```

This preserves the named MongoDB volume.

## 13. Hands-on challenge checklist

Complete these exercises without copying the solution first.

-   [ ] Start all services with one Compose command.
-   [ ] Create a user through User Service.
-   [ ] Retrieve the user by ID.
-   [ ] Create an order through Order Service.
-   [ ] Explain how Order Service finds User Service by name.
-   [ ] Inspect the Compose network and identify its connected
    containers.
-   [ ] Stop User Service and observe what happens to order creation.
-   [ ] Start User Service and retry the request.
-   [ ] Restart MongoDB's container and verify the data remains.
-   [ ] Run `docker compose down` and bring the application back up.
-   [ ] Explain the difference between `docker compose down` and
    `docker compose down -v`.
-   [ ] Change a service's code and rebuild only that service.

## 14. Interview questions

1.  What is Docker Compose, and why is it used?
2.  What is the purpose of `compose.yaml`?
3.  What is the difference between `docker compose up` and
    `docker compose up -d`?
4.  What does `depends_on` do? Does it guarantee application readiness?
5.  How do containers discover each other in a Compose network?
6.  Why should services use service names instead of container IP
    addresses?
7.  What is the difference between a bind mount and a named volume?
8.  What happens to named volumes when you run `docker compose down`?
9.  What is the difference between a host port and a container port?
10. How would you troubleshoot a container that repeatedly exits?

## 15. Cleanup

Stop and remove the project's containers and network while preserving
database data:

``` bash
docker compose down
```

To delete the database volume as well (destructive):

``` bash
docker compose down -v
```

------------------------------------------------------------------------

## Learning outcome

After completing this lab, you should be able to explain and
demonstrate:

-   Multi-container application setup with Docker Compose.
-   Node.js service-to-service communication.
-   Docker Compose DNS and bridge networking.
-   MongoDB connectivity and persistent named volumes.
-   Image builds, logs, lifecycle commands, and troubleshooting.

**Next step:** Extend this project with a Notification Service and
Redis, then add health checks, restart policies, environment files, and
resource limits.
