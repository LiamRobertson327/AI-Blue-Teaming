FROM python:3.13.9-slim

WORKDIR /app

COPY requirements.txt .
COPY expense_cfg.json .

RUN pip install --no-cache-dir -r requirements.txt

COPY filter.py .

EXPOSE 5001

CMD ["gunicorn", "-w", "2","--threads", "2", "-b", "0.0.0.0:5001", "filter:app"]