FROM nginx:alpine

# Instala OpenSSL e cria certificado auto-assinado
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=PT/ST=Lisbon/L=Lisbon/O=42 School/CN=localhost"

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]