# Day 5: Docker Volumes & Persistent Storage

## Learning goal

Understand why container data can disappear and how Docker Volumes, bind
mounts, and `tmpfs` are used to store data.

## 1. The story: A restaurant's memory

Imagine a restaurant where staff write customer orders on a whiteboard
in the kitchen. If the kitchen is replaced, the whiteboard and its
orders may be lost.

A Docker container is like that kitchen. Data stored only in its
writable layer can disappear when the container is removed.

A Docker Volume is like a separate storage room: it exists independently
of the container and can be attached to a replacement container.

**Remember: Containers can be temporary. Important data should
persist.**

## 2. Docker storage options

  -----------------------------------------------------------------------
  Type                    Description             Common use
  ----------------------- ----------------------- -----------------------
  Docker Volume           Docker-managed storage  Databases and
                          that exists separately  application data
                          from a container        

  Bind Mount              Maps a host-machine     Local development and
                          file or directory into  sharing files
                          a container             

  `tmpfs`                 Temporary memory-backed Temporary runtime data
                          storage                 
  -----------------------------------------------------------------------

## 3. Docker Volume commands

``` bash
# Create a volume
docker volume create my-storage

# List volumes
docker volume ls

# Inspect a volume
docker volume inspect my-storage

# Remove a volume when it is no longer in use
docker volume rm my-storage
```

## 4. Hands-on lab: Prove that data survives

### Step 1: Create a volume

``` bash
docker volume create my-storage
```

### Step 2: Start an Ubuntu container with the volume

``` bash
docker run -it --name my-container -v my-storage:/data ubuntu bash
```

Inside the container:

``` bash
echo "My important data" > /data/message.txt
cat /data/message.txt
exit
```

### Step 3: Remove the container

``` bash
docker rm my-container
```

The container is removed, but the named volume remains.

### Step 4: Start a new container using the same volume

``` bash
docker run -it --name new-container -v my-storage:/data ubuntu bash
```

### Step 5: Read the previous file

``` bash
cat /data/message.txt
```

Expected output:

``` text
My important data
```

The new container can read the file because both containers used the
same volume.

Exit:

``` bash
exit
```

## 5. Bind mount example

A bind mount connects a host directory to a path inside the container.

``` bash
mkdir -p ~/docker/site
cd ~/docker/site
echo "<h1>Hello from my host machine</h1>" > index.html

docker run -d \
  --name web \
  -p 8080:80 \
  --mount type=bind,source="$PWD",target=/usr/share/nginx/html,readonly \
  nginx
```

Open `http://localhost:8080` in your browser.

The `readonly` option lets the container read the files but prevents it
from modifying them.

Clean up:

``` bash
docker rm -f web
```

## 6. tmpfs example

A `tmpfs` mount stores temporary data in memory. It is not intended for
durable storage.

``` bash
docker run -d --name temporary-app --tmpfs /app-temp nginx
```

Clean up:

``` bash
docker rm -f temporary-app
```

## 7. Practical example: MySQL with a persistent volume

### Step 1: Create a volume

``` bash
docker volume create mysql-data
```

### Step 2: Start MySQL with the volume

Use a strong lab password. Do not commit real credentials to Git.

``` bash
docker run -d \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD='ChangeThisLabPassword!' \
  -e MYSQL_DATABASE=foodapp \
  -v mysql-data:/var/lib/mysql \
  mysql:8.4
```

Check startup:

``` bash
docker ps
docker logs mysql-db
```

Wait until MySQL is ready.

### Step 3: Create sample data

``` bash
docker exec -it mysql-db mysql -uroot -p
```

Enter your lab password, then run:

``` sql
USE foodapp;

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100)
);

INSERT INTO customers (name) VALUES ('Amit'), ('Priya');

SELECT * FROM customers;
EXIT;
```

### Step 4: Remove the container

``` bash
docker rm -f mysql-db
```

### Step 5: Recreate MySQL using the same volume

``` bash
docker run -d \
  --name mysql-db-new \
  -e MYSQL_ROOT_PASSWORD='ChangeThisLabPassword!' \
  -v mysql-data:/var/lib/mysql \
  mysql:8.4
```

Wait for MySQL to become ready, then connect:

``` bash
docker exec -it mysql-db-new mysql -uroot -p
```

``` sql
USE foodapp;
SELECT * FROM customers;
EXIT;
```

The records should still be present.

**Important:** MySQL initialization variables such as `MYSQL_DATABASE`
and `MYSQL_ROOT_PASSWORD` initialize a new, empty data directory.
Reusing a volume with an existing database does not reinitialize it.

## 8. Backup basics

A persistent volume is not a backup. It protects data from ordinary
container replacement, but not from accidental volume deletion,
corruption, or host failure.

For databases, prefer database-native backups such as `mysqldump` or a
database-aware backup tool.

Example logical backup:

``` bash
docker exec mysql-db-new sh -c \
  'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" foodapp' \
  > foodapp-backup.sql
```

Protect backup files and credentials. Avoid exposing passwords in shell
history, logs, or source control. In production, use secure secrets
management and regularly test restores.

A raw archive of a live database volume may be inconsistent. Stop the
database cleanly first or use a database-supported snapshot/backup
process.

## 9. Docker Compose named volume example

Create `compose.yaml`:

``` yaml
services:
  database:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: foodapp
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

Create a `.env` file beside it:

``` text
MYSQL_ROOT_PASSWORD=ChangeThisLabPassword!
```

Add `.env` to `.gitignore`. Do not commit secrets.

Start:

``` bash
docker compose up -d
```

Stop and remove containers and the network while keeping the named
volume:

``` bash
docker compose down
```

**Warning:** This command also removes Compose-managed named volumes:

``` bash
docker compose down -v
```

Use `-v` only when you intentionally want to delete the stored data.

## 10. Production best practices

-   Keep important data outside the container's writable layer.
-   Use named volumes for Docker-managed persistent data.
-   Use bind mounts when a specific host path must be shared.
-   Use `tmpfs` only for temporary data.
-   Back up databases with database-aware tools.
-   Store credentials in a secrets manager, not in Git.
-   Test restore procedures, not just backup creation.
-   Understand where volume data lives and how it is protected on the
    Docker host.
-   For Kubernetes, learn PersistentVolumes and PersistentVolumeClaims.

## 11. Common troubleshooting

### Volume is in use

``` bash
docker ps -a
docker volume inspect my-storage
```

Remove or update containers using the volume before removing it.

### Data is not visible

``` bash
docker inspect <container-name>
```

Check the volume name and container destination path.

### Permission denied

Check the host directory or volume ownership, permissions, and the user
running the application inside the container before changing
permissions.

### Volume was deleted

Docker does not automatically recover a deleted volume. Restore from a
tested backup if available.

## 12. Interview questions

1.  What is a Docker Volume?
2.  Why should important data not be stored only in a container's
    writable layer?
3.  What is the difference between a named volume and a bind mount?
4.  What is `tmpfs`, and when would you use it?
5.  Does removing a container automatically remove its named volume?
6.  What is the difference between `docker compose down` and
    `docker compose down -v`?
7.  Why is a volume not a replacement for a backup?
8.  How would you back up and restore a production database running in
    Docker?

## 13. Day 5 practice checklist

-   [ ] Create and inspect a Docker volume.
-   [ ] Write a file into a mounted volume.
-   [ ] Remove the container and verify the file from a new container.
-   [ ] Run Nginx using a bind mount.
-   [ ] Try a `tmpfs` mount.
-   [ ] Run MySQL with a named volume.
-   [ ] Recreate the MySQL container and verify that records remain.
-   [ ] Create a database backup and understand how to restore it.
-   [ ] Explain volumes, bind mounts, and `tmpfs`.

## Key takeaway

**Containers are replaceable. Data is valuable. Persistent storage and
tested backups help protect it.**

**Next lesson:** Day 6 --- Docker Compose: Running Multiple Containers
Together.
