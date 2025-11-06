To start the docker container you first need to setup a .env file:

Create a new file called .env and add these lines:

N8N_ADMIN_USER=<admin_user>
N8N_ADMIN_PASS=<admin_password>
FILTER_API_TOKEN=<any_string>

Fill in the respective data above and save it.

To start the container go into this directory and type

> docker compose up -d --build

To stop it type

> docker compose down

Once the service is running it can be accessed at http://localhost:5678

