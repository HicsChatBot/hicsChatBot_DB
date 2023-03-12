# hicsChatBot_DB


### Local Development
* For local developer, you can create a PostgreSQL database running in a docker container. 
    1. install (docker)[https://docs.docker.com/get-docker/] and optionally: (Docker Desktop)[https://www.docker.com/products/docker-desktop/]
    1. cd into the directory that contains the `docker-compose.yml` file.
    1. Run: `docker-compose up -d` to create a running instance of PostgreSQL database in Docker and creates a `postgres-data` directory to store the database data.

### Deployment
* Web app and PostgreSQL database will both be deployed to (Render)[https://render.com/]
