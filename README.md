# hicsChatBot_DB

## Architecture
1. Model 
    * Represents an entity in the database.
1. Controller
    * handles the logic for the app.
1. Route: The API endpoint



## Local Development
* For local developer, you can create a PostgreSQL database running in a docker container. 
    1. install (docker)[https://docs.docker.com/get-docker/] and optionally: (Docker Desktop)[https://www.docker.com/products/docker-desktop/]
    1. cd into the directory that contains the `docker-compose.yml` file.
    1. Run: `docker-compose up -d` to create a running instance of PostgreSQL database in Docker and creates a `postgres-data` directory to store the database data.

    1. To check if the database is ready to accept connections: (in the container) go to 'Logs' and check that there is `LOG:  database system is ready to accept connections`
    1. With the container running and database ready to accept connections, go to terminal:
        1. log in to the database: `psql -U hicsbot`
            * "hicsbot" is the name of the database user (specified in docker-compose.yml)
        1. Can now execute sql queries!

## Deployment
* Web app and PostgreSQL database will both be deployed to (Render)[https://render.com/]
