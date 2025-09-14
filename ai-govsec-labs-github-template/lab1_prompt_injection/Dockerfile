# Lab 1: Prompt Injection
FROM python:3.11-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir requests
# default command runs tests showing vulnerable + defended behavior
CMD ["python", "test_lab1.py"]
