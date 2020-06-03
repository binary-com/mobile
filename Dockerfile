 
FROM nginx:alpine
COPY ./www /usr/share/nginx/html
COPY ./download /usr/share/nginx/html/download
COPY ./default.conf /etc/nginx/conf.d/default.conf
