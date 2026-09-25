#ifndef FOODIE_HTTPLIB_H
#define FOODIE_HTTPLIB_H

#include <string>
#include <functional>
#include <unordered_map>
#include <sstream>
#include <thread>
#include <vector>
#include <cstring>
#include <cstdlib>

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")
using socket_t = SOCKET;
#define INVALID_SOCKET_VALUE INVALID_SOCKET
#define CLOSE_SOCKET closesocket
#else
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
using socket_t = int;
#define INVALID_SOCKET_VALUE (-1)
#define CLOSE_SOCKET close
#endif

namespace httplib {

struct Request {
    std::string method;
    std::string path;
    std::string body;
};

class Response {
public:
    int status = 200;
    std::string body;
    std::string content_type = "text/plain";

    void set_content(const std::string& content, const char* type) {
        body = content;
        content_type = type ? type : "text/plain";
    }
};

class Server {
public:
    using Handler = std::function<void(const Request&, Response&)>;

    void Get(const std::string& path, Handler handler) {
        get_handlers[path] = handler;
    }

    void Post(const std::string& path, Handler handler) {
        post_handlers[path] = handler;
    }

    bool listen(const char* host, int port) {
#ifdef _WIN32
        WSADATA wsa;
        if (WSAStartup(MAKEWORD(2, 2), &wsa) != 0)
            return false;
#endif

        socket_t server_socket = socket(AF_INET, SOCK_STREAM, 0);
        if (server_socket == INVALID_SOCKET_VALUE)
            return false;

        int opt = 1;
#ifdef _WIN32
        setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR,
                   reinterpret_cast<const char*>(&opt), sizeof(opt));
#else
        setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
#endif

        sockaddr_in address{};
        address.sin_family = AF_INET;
        address.sin_port = htons(static_cast<unsigned short>(port));

        if (host == nullptr || std::string(host) == "localhost") {
            address.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
        } else {
            inet_pton(AF_INET, host, &address.sin_addr);
        }

        if (bind(server_socket,
                 reinterpret_cast<sockaddr*>(&address),
                 sizeof(address)) < 0) {
            CLOSE_SOCKET(server_socket);
#ifdef _WIN32
            WSACleanup();
#endif
            return false;
        }

        if (::listen(server_socket, 10) < 0) {
            CLOSE_SOCKET(server_socket);
#ifdef _WIN32
            WSACleanup();
#endif
            return false;
        }

        while (true) {
            sockaddr_in client_address{};
#ifdef _WIN32
            int client_length = sizeof(client_address);
#else
            socklen_t client_length = sizeof(client_address);
#endif

            socket_t client = accept(
                server_socket,
                reinterpret_cast<sockaddr*>(&client_address),
                &client_length
            );

            if (client == INVALID_SOCKET_VALUE)
                continue;

            std::thread(&Server::handle_client, this, client).detach();
        }

        return true;
    }

private:
    std::unordered_map<std::string, Handler> get_handlers;
    std::unordered_map<std::string, Handler> post_handlers;

    static bool send_all(socket_t socket, const std::string& data) {
        const char* ptr = data.c_str();
        int remaining = static_cast<int>(data.size());

        while (remaining > 0) {
#ifdef _WIN32
            int sent = send(socket, ptr, remaining, 0);
#else
            int sent = static_cast<int>(send(socket, ptr, remaining, 0));
#endif
            if (sent <= 0)
                return false;

            ptr += sent;
            remaining -= sent;
        }

        return true;
    }

    void handle_client(socket_t client) {
        char buffer[8192];
        std::string request_data;

        while (request_data.find("\r\n\r\n") == std::string::npos &&
               request_data.size() < 1024 * 1024) {
#ifdef _WIN32
            int received = recv(client, buffer, sizeof(buffer), 0);
#else
            int received = static_cast<int>(
                recv(client, buffer, sizeof(buffer), 0)
            );
#endif
            if (received <= 0)
                break;

            request_data.append(buffer, received);
        }

        size_t header_end = request_data.find("\r\n\r\n");
        if (header_end == std::string::npos) {
            CLOSE_SOCKET(client);
            return;
        }

        std::string headers = request_data.substr(0, header_end);
        std::string body = request_data.substr(header_end + 4);

        std::istringstream header_stream(headers);
        std::string request_line;
        std::getline(header_stream, request_line);

        if (!request_line.empty() && request_line.back() == '\r')
            request_line.pop_back();

        std::istringstream request_line_stream(request_line);

        Request req;
        request_line_stream >> req.method >> req.path;

        size_t content_length = 0;
        std::string line;

        while (std::getline(header_stream, line)) {
            if (!line.empty() && line.back() == '\r')
                line.pop_back();

            const std::string key = "Content-Length:";
            if (line.size() >= key.size() &&
                line.compare(0, key.size(), key) == 0) {
                content_length = static_cast<size_t>(
                    std::strtoull(line.substr(key.size()).c_str(), nullptr, 10)
                );
            }
        }

        while (body.size() < content_length) {
#ifdef _WIN32
            int received = recv(client, buffer, sizeof(buffer), 0);
#else
            int received = static_cast<int>(
                recv(client, buffer, sizeof(buffer), 0)
            );
#endif
            if (received <= 0)
                break;

            body.append(buffer, received);
        }

        req.body = body.substr(0, content_length);

        Response res;
        Handler handler = nullptr;

        if (req.method == "GET") {
            auto it = get_handlers.find(req.path);
            if (it != get_handlers.end())
                handler = it->second;
        } else if (req.method == "POST") {
            auto it = post_handlers.find(req.path);
            if (it != post_handlers.end())
                handler = it->second;
        }

        if (handler) {
            handler(req, res);
        } else {
            res.status = 404;
            res.set_content("Not Found", "text/plain");
        }

        std::string status_text = (res.status == 200) ? "OK" : "Not Found";

        std::ostringstream response;
        response << "HTTP/1.1 " << res.status << " " << status_text << "\r\n";
        response << "Content-Type: " << res.content_type << "\r\n";
        response << "Content-Length: " << res.body.size() << "\r\n";
        response << "Access-Control-Allow-Origin: *\r\n";
        response << "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
        response << "Access-Control-Allow-Headers: Content-Type\r\n";
        response << "Connection: close\r\n";
        response << "\r\n";
        response << res.body;

        send_all(client, response.str());

        CLOSE_SOCKET(client);
    }
};

} // namespace httplib

#endif
