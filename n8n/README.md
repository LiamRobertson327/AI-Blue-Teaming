# To Run and Test the Project

You will need to be working inside ./n8n

## We fist need to create a .env file with the structure below
```
# Credentials for n8n Basic Authentication
N8N_ADMIN_USER=<usr>
N8N_ADMIN_PASS=<pwd>
FILTER_API_TOKEN=<tk>
```

## First run this command to ensure you have the updated package.zip file
```
git lfs pull 
```

## Unzip the file
```
unzip package.zip
```

## Change folder permissions - Windows and Linux Users
```
# n8n
sudo chown -R 1000:1000 ./package/n8n_data ./package/n8n_logs

# Loki
sudo chown -R 10001:10001 ./package/loki_data

# Grafana
sudo chown -R 472:472 ./package/grafana_data ./package/grafana_logs ./package/grafana_config

# Alloy
sudo chown -R 0:0 ./package/alloy_positions

# Qdrant
sudo chown -R 0:0 ./package/qdrant_data
```
## Change folder permissions - MAC Users
*WARNING: DO NOT USE THIS FOR PRODUCTION.  chmod -R 777 is insecure for production, but okay for local testing only.  Docker containers that use bind mounts without named volumes on MAC behave differently and require changing these permissions.*
```
sudo chflags -R nouchg ./package
sudo chmod -R 777 ./package
```

## Start the Docker Containers
```
docker compose up -d --build
```

## Stop the Docker Containers
```
docker compose down
```

## To access the services
```
n8n - http://localhost:5678
grafana - http://localhost:3000
Qdrant - http://localhost:6333/dashboard
```