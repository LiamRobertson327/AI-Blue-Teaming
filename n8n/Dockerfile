FROM python:3.13

WORKDIR /app
COPY requirements.txt .
COPY expense_cfg.json .
RUN pip install --no-cache-dir -r requirements.txt
COPY filter.py .
CMD ["python", "filter.py"]
