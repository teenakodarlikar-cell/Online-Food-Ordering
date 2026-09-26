#include <iostream>
#include <fstream>
#include <cstdlib>
#include <string>
#include <cctype>
#include "httplib.h"

using namespace std;
using namespace httplib;


// Get string value from JSON
string getValue(string data, string key)
{
    string search = "\"" + key + "\":\"";
    size_t start = data.find(search);

    if (start == string::npos)
        return "Not Available";

    start += search.length();

    size_t end = data.find("\"", start);

    if (end == string::npos)
        return "Not Available";

    return data.substr(start, end - start);
}


// Get number value from JSON
string getNumberValue(string data, string key)
{
    string search = "\"" + key + "\":";
    size_t start = data.find(search);

    if (start == string::npos)
        return "0";

    start += search.length();

    while (start < data.length() && data[start] == ' ')
        start++;

    size_t end = start;

    while (end < data.length() &&
           (isdigit(data[end]) || data[end] == '.'))
    {
        end++;
    }

    return data.substr(start, end - start);
}


int main()
{
    Server server;


    // ================================
    // TEST BACKEND
    // ================================

    server.Get("/test", [](const Request& req, Response& res)
    {
        res.set_content(
            "Foodie C++ Backend is Working!",
            "text/plain"
        );
    });


    // ================================
    // REGISTER USER
    // ================================

    server.Post("/register", [](const Request& req, Response& res)
    {
        string name = getValue(req.body, "name");
        string email = getValue(req.body, "email");
        string phone = getValue(req.body, "phone");
        string password = getValue(req.body, "password");


        ofstream file("users.txt", ios::app);

        file << name << "|"
             << email << "|"
             << phone << "|"
             << password << endl;

        file.close();


        cout << endl;
        cout << "New user registered!" << endl;
        cout << "Name: " << name << endl;


        res.set_content(
            "Registration successful!",
            "text/plain"
        );
    });


    // ================================
    // LOGIN USER
    // ================================

    server.Post("/login", [](const Request& req, Response& res)
    {
        string email = getValue(req.body, "email");
        string password = getValue(req.body, "password");


        ifstream file("users.txt");

        string line;
        bool loginSuccess = false;


        while (getline(file, line))
        {
            string savedEmail = "";
            string savedPassword = "";


            size_t first = line.find("|");
            size_t second = line.find("|", first + 1);
            size_t third = line.find("|", second + 1);


            if (first != string::npos &&
                second != string::npos &&
                third != string::npos)
            {
                savedEmail =
                    line.substr(
                        first + 1,
                        second - first - 1
                    );


                savedPassword =
                    line.substr(third + 1);


                if (email == savedEmail &&
                    password == savedPassword)
                {
                    loginSuccess = true;
                    break;
                }
            }
        }


        file.close();


        if (loginSuccess)
        {
            cout << endl;
            cout << "User login successful!" << endl;


            res.set_content(
                "Login successful!",
                "text/plain"
            );
        }
        else
        {
            cout << endl;
            cout << "Login failed!" << endl;


            res.set_content(
                "Invalid email or password.",
                "text/plain"
            );
        }
    });


    // ================================
    // RECEIVE ORDER
    // ================================

    server.Post("/order", [](const Request& req, Response& res)
    {
        static int orderNumber = 1000;

        orderNumber++;

        string orderId =
            "FD" + to_string(orderNumber);


        string name =
            getValue(req.body, "name");

        string phone =
            getValue(req.body, "phone");

        string email =
            getValue(req.body, "email");

        string address =
            getValue(req.body, "address");

        string payment =
            getValue(req.body, "payment");

        string total =
            getNumberValue(req.body, "total");


        // ================================
        // SAVE ORDER
        // ================================

        ofstream file(
            "orders.txt",
            ios::app
        );


        file << "========================================"
             << endl;

        file << "           NEW FOOD ORDER"
             << endl;

        file << "========================================"
             << endl;

        file << endl;


        file << "Order ID : "
             << orderId
             << endl;

        file << "Customer : "
             << name
             << endl;

        file << "Phone    : "
             << phone
             << endl;

        file << "Email    : "
             << email
             << endl;

        file << "Address  : "
             << address
             << endl;

        file << "Payment  : "
             << payment
             << endl;


        file << endl;

        file << "Items:"
             << endl;


        // ================================
        // FIND ITEMS
        // ================================

        size_t itemsStart =
            req.body.find("\"items\":[");


        if (itemsStart != string::npos)
        {
            size_t current = itemsStart;

            int itemNumber = 1;


            while (true)
            {
                size_t nameStart =
                    req.body.find(
                        "\"name\":\"",
                        current
                    );


                if (nameStart == string::npos)
                    break;


                nameStart += 8;


                size_t nameEnd =
                    req.body.find(
                        "\"",
                        nameStart
                    );


                if (nameEnd == string::npos)
                    break;


                string itemName =
                    req.body.substr(
                        nameStart,
                        nameEnd - nameStart
                    );


                string itemPrice =
                    getNumberValue(
                        req.body.substr(nameEnd),
                        "price"
                    );


                string itemQuantity =
                    getNumberValue(
                        req.body.substr(nameEnd),
                        "quantity"
                    );


                file << itemNumber
                     << ". "
                     << itemName
                     << endl;


                file << "   Price    : Rs."
                     << itemPrice
                     << endl;


                file << "   Quantity : "
                     << itemQuantity
                     << endl;


                file << endl;


                itemNumber++;

                current =
                    nameEnd + 1;
            }
        }


        file << "Total : Rs."
             << total
             << endl;


        file << endl;

        file << "========================================"
             << endl;

        file << endl;


        file.close();


        // ================================
        // CONSOLE MESSAGE
        // ================================

        cout << endl;

        cout << "New order received!"
             << endl;

        cout << "Order ID: "
             << orderId
             << endl;

        cout << "Customer: "
             << name
             << endl;


        // ================================
        // RESPONSE
        // ================================

        res.set_content(
            "Order received successfully! Order ID: "
            + orderId,
            "text/plain"
        );
    });


    // ================================
    // SERVER START
    // ================================

    cout << "================================="
         << endl;

    cout << "       FOODIE C++ BACKEND"
         << endl;

    cout << "================================="
         << endl;


    // Render provides PORT.
    // Local computer will use 8080.

    const char* portEnv =
        getenv("PORT");


    int port =
        portEnv
        ? atoi(portEnv)
        : 8080;


    cout << "Server running on port "
         << port
         << "..."
         << endl;

    cout << "Keep this terminal open."
         << endl;


    // Listen on all network interfaces

    server.listen(
        "0.0.0.0",
        port
    );


    return 0;
}