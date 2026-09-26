FROM gcc:latest

WORKDIR /app

COPY backend.cpp .
COPY httplib.h .

RUN g++ backend.cpp -o backend

EXPOSE 8080

CMD ["./backend"]