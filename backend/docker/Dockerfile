FROM python:3.11-slim

WORKDIR /app

# Instala dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    netcat-openbsd \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia requirements primeiro (melhor cache)
COPY requirements.txt /app/

RUN pip install --no-cache-dir -r requirements.txt

# Copia o código da aplicação
COPY app/ /app/

# Copia o entrypoint (apenas para build da imagem, será sobrescrito no dev pelo Compose)
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Define entrypoint padrão
ENTRYPOINT ["/app/entrypoint.sh"]

# CMD padrão para dev
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]