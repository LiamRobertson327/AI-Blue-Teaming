
<h1 align='center'>🚀 Lighthouse - Hub for Growth & Journeys</h1>

[![Docker](https://img.shields.io/badge/Docker-Desktop-2496ED?logo=Docker&logoColor=2496ED)](https://www.docker.com/products/docker-desktop/) 
[![n8n](https://img.shields.io/badge/n8n-Workflow-EA4B71?logo=n8n&logoColor=EA4B71)](https://n8n.io/)
[![grafana](https://img.shields.io/badge/Grafana-Labs-F46800?logo=Grafana&logoColor=F46800)](https://grafana.com/)



## **⚠️ WARNING!**
*This project is built as an Enterprise Copilot that integrates multiple agents, including email, document, and expense management.  It is built with n8n and hosted in docker containers and is meant to be run locally on a machine.*

## 📋 Requirements
* Ability to run docker containers
    * Docker desktop or
    * Another docker engine
    * WSL 2 enabled
* Docker Compose

## ✨ Features
* Fully self-hosted with application running in multiple containers in an isolated network
* RAG Vector Database implemented with Qdrant
* Grafana to view logs
* Multiple AI Agents to handle
    * Expense Management
    * Document Management
    * Email Management

## 🗂️ Repository Structure
```
AI-Blue-Teaming
├── docs/
│    ├── markdown/                      # Misc material *Not related to AI Agent*
│    └──user/                           # Contains the userguide
│
├── labs/                               # Labs that demonstrate vulnerabilities and defenses
│    ├── lab1_prompt_injection/         
│    ├── lab2_ai_generated_code_vulns/
│    ├── lab_3_mcp_rce/
│    └── lab4_agentic_browser
│
├── n8n/                                # Files to run the agent *Will be moved to src*
│    └── config
├── src/
│    ├── app/                           # Currently stored in a docker container *Need to send to this folder*
│    ├── logs/                          # Currently stored in a docker container *Need to send to this folder*
│    ├── presentation/
│    ├── redteam/
│    ├── report/
│    └── thread_mode/
```

## 📋 Installation for Windows

### 1. Enable WSL 2
* Open powershell as an administrator
* Run the command $```wsl.exe -l -v```
* If you see the linux distribution says v2 then skip this step.  Otherwise run the command where (distribution name) is the NAME of the linux distrubtion you have installed. $```wsl.exe --set-version (distribution name) 2```
* Set v2 as the default version $```wsl.exe --set-default-version 2```

### 2. Install Docker Desktop
* [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
* Login or make an account - It's free.  Don't worry. 😄

### 3. Run the docker compose file
* *Note: Documentation will be added in the future*

## 🙋🏻‍♂️ How to Use
*Full documentation of how to use this product can be found here [![userguide](https://img.shields.io/badge/User-guide-c471de)](https://github.com/LiamRobertson327/AI-Blue-Teaming/blob/main/docs/usr/userguide.md)*

* *Note: Brief documentation will be added in the future*