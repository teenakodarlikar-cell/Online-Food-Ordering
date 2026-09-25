// ========================================
// FOODIE - MAIN SCRIPT
// ========================================


// ========================================
// CART
// ========================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ========================================
// UPDATE CART COUNT
// ========================================

function updateCartCount() {

    const cartCount = document.getElementById("cartCount");

    if (!cartCount) {
        return;
    }

    let totalItems = 0;

    cart.forEach(function(item) {
        totalItems += item.quantity;
    });

    cartCount.textContent = totalItems;
}


// ========================================
// ADD TO CART
// ========================================

function addToCart(name, price) {

    let item = cart.find(function(food) {
        return food.name === name;
    });

    if (item) {

        item.quantity++;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();

    alert(name + " added to cart!");
}


// ========================================
// SAVE CART
// ========================================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );
}


// ========================================
// GO TO CART
// ========================================

function goToCart() {

    window.location.href = "cart.html";
}


// ========================================
// SEARCH FOOD
// ========================================

function filterFood() {

    const searchInput =
        document.getElementById("searchFood");

    if (!searchInput) {
        return;
    }

    const searchText =
        searchInput.value.toLowerCase().trim();

    const foodCards =
        document.querySelectorAll(".menu-food-card");

    foodCards.forEach(function(card) {

        const title =
            card.querySelector(".menu-title");

        const description =
            card.querySelector("p");

        if (!title) {
            return;
        }

        const foodName =
            title.textContent.toLowerCase();

        const foodDescription =
            description
                ? description.textContent.toLowerCase()
                : "";

        if (
            foodName.includes(searchText) ||
            foodDescription.includes(searchText)
        ) {

            card.style.display = "block";

        } else {

            card.style.display = "none";
        }

    });
}


// ========================================
// CATEGORY FILTER
// ========================================

function filterCategory(category) {

    const foodCards =
        document.querySelectorAll(".menu-food-card");

    const buttons =
        document.querySelectorAll(".category-btn");

    buttons.forEach(function(button) {

        button.classList.remove("active");

        const buttonText =
            button.textContent.toLowerCase().trim();

        if (
            buttonText === category ||
            (category === "all" && buttonText === "all")
        ) {
            button.classList.add("active");
        }
    });

    foodCards.forEach(function(card) {

        const foodCategory =
            card.getAttribute("data-category");

        if (
            category === "all" ||
            foodCategory === category
        ) {

            card.style.display = "block";

        } else {

            card.style.display = "none";
        }

    });
}

function getFoodImage(name) {

    const images = {

        "Cheese Pizza":
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80",

        "Classic Burger":
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",

        "Chicken Biryani":
        "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=300&q=80",

        "Hakka Noodles":
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80",

        "Veggie Pizza":
        "https://images.unsplash.com/photo-1579751626657-72bc17010498?auto=format&fit=crop&w=300&q=80",

        "Cheese Burger":
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80",

        "Veg Biryani":
        "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=300&q=80",

        "Fresh Lime Drink":
        "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80"
    };

    return images[name] || 
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";
}
// ========================================
// DISPLAY CART
// ========================================

function displayCart() {

    const cartItems =
        document.getElementById("cartItems");

    if (!cartItems) {
        return;
    }

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">

                <div>🛒</div>

                <h2>Your cart is empty</h2>

                <p>
                    Add some delicious food to your cart.
                </p>

                <button
                    onclick="window.location.href='menu.html'">
                    Explore Menu
                </button>

            </div>
        `;

        updateSummary();
        updateCartCount();

        return;
    }


    cartItems.innerHTML = "";


    cart.forEach(function(item, index) {

        cartItems.innerHTML += `

            <div class="cart-item">

                <img
                    src="${getFoodImage(item.name)}"
                    alt="${item.name}"
                >

                <div class="cart-item-info">

                    <h3>${item.name}</h3>

                    <p>₹${item.price}</p>

                </div>


                <div class="quantity">

                    <button
                        onclick="decreaseQuantity(${index})">
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="increaseQuantity(${index})">
                        +
                    </button>

                </div>


                <strong>
                    ₹${item.price * item.quantity}
                </strong>


                <button
                    class="remove-btn"
                    onclick="removeItem(${index})">
                    ✕
                </button>

            </div>
        `;
    });


    updateSummary();
    updateCartCount();
}


// ========================================
// INCREASE QUANTITY
// ========================================

function increaseQuantity(index) {

    if (!cart[index]) {
        return;
    }

    cart[index].quantity++;

    saveCart();

    displayCart();

    updateCartCount();
}


// ========================================
// DECREASE QUANTITY
// ========================================

function decreaseQuantity(index) {

    if (!cart[index]) {
        return;
    }

    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        cart.splice(index, 1);
    }

    saveCart();

    displayCart();

    updateCartCount();
}


// ========================================
// REMOVE ITEM
// ========================================

function removeItem(index) {

    if (!cart[index]) {
        return;
    }

    cart.splice(index, 1);

    saveCart();

    displayCart();

    updateCartCount();
}


// ========================================
// CART SUMMARY
// ========================================

function updateSummary() {

    let subtotal = 0;

    cart.forEach(function(item) {

        subtotal +=
            item.price * item.quantity;
    });


    let delivery =
        subtotal > 0 ? 40 : 0;

    let discount =
        subtotal >= 500 ? 50 : 0;

    let total =
        subtotal + delivery - discount;


    const subtotalElement =
        document.getElementById("subtotal");

    const deliveryElement =
        document.getElementById("delivery");

    const discountElement =
        document.getElementById("discount");

    const totalElement =
        document.getElementById("total");


    if (subtotalElement) {

        subtotalElement.innerText =
            "₹" + subtotal;
    }


    if (deliveryElement) {

        deliveryElement.innerText =
            "₹" + delivery;
    }


    if (discountElement) {

        discountElement.innerText =
            "₹" + discount;
    }


    if (totalElement) {

        totalElement.innerText =
            "₹" + total;
    }
}


// ========================================
// PLACE ORDER
// ========================================

function placeOrder() {

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }

    window.location.href =
        "checkout.html";
}


// ========================================
// DISPLAY CHECKOUT
// ========================================

function displayCheckout() {

    const checkoutItems =
        document.getElementById("checkoutItems");

    if (!checkoutItems) {
        return;
    }


    let subtotal = 0;

    checkoutItems.innerHTML = "";


    cart.forEach(function(item) {

        const itemTotal =
            item.price * item.quantity;

        subtotal += itemTotal;


        checkoutItems.innerHTML += `

            <div class="checkout-item">

                <span>
                    ${item.name} × ${item.quantity}
                </span>

                <strong>
                    ₹${itemTotal}
                </strong>

            </div>
        `;
    });


    const delivery =
        cart.length > 0 ? 40 : 0;

    const discount =
        subtotal >= 500 ? 50 : 0;

    const total =
        subtotal + delivery - discount;


    const checkoutSubtotal =
        document.getElementById(
            "checkoutSubtotal"
        );

    const checkoutDiscount =
        document.getElementById(
            "checkoutDiscount"
        );

    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );


    if (checkoutSubtotal) {

        checkoutSubtotal.innerText =
            "₹" + subtotal;
    }


    if (checkoutDiscount) {

        checkoutDiscount.innerText =
            "₹" + discount;
    }


    if (checkoutTotal) {

        checkoutTotal.innerText =
            "₹" + total;
    }
}


// ========================================
// CONFIRM ORDER
// ========================================

function confirmOrder() {

    const name =
        document.getElementById(
            "customerName"
        ).value.trim();

    const phone =
        document.getElementById(
            "phone"
        ).value.trim();

    const email =
        document.getElementById(
            "email"
        ).value.trim();

    const address =
        document.getElementById(
            "address"
        ).value.trim();


    if (
        name === "" ||
        phone === "" ||
        email === "" ||
        address === ""
    ) {

        alert(
            "Please fill all delivery details."
        );

        return;
    }


    if (cart.length === 0) {

        alert("Your cart is empty.");

        window.location.href =
            "menu.html";

        return;
    }


    const paymentInput =
        document.querySelector(
            'input[name="payment"]:checked'
        );


    if (!paymentInput) {

        alert(
            "Please select a payment method."
        );

        return;
    }


    const payment =
        paymentInput.value;


    let subtotal = 0;


    cart.forEach(function(item) {

        subtotal +=
            item.price * item.quantity;
    });


    const delivery = 40;

    const discount =
        subtotal >= 500 ? 50 : 0;

    const total =
        subtotal + delivery - discount;


    const orderData = {

        name: name,

        phone: phone,

        email: email,

        address: address,

        payment: payment,

        items: cart,

        total: total
    };


    fetch(
        "http://localhost:8080/order",
        {
            method: "POST",

            headers: {
                "Content-Type": "text/plain"
            },

            body: JSON.stringify(orderData)
        }
    )

    .then(function(response) {

        return response.text();
    })

    .then(function(data) {

        console.log(data);


        // Get Order ID

        const orderId =
            data.match(/FD\d+/);


        if (orderId) {

            localStorage.setItem(
                "orderId",
                orderId[0]
            );
        }


        // Save customer details

        localStorage.setItem(
            "customerName",
            name
        );

        localStorage.setItem(
            "customerPhone",
            phone
        );

        localStorage.setItem(
            "customerEmail",
            email
        );

        localStorage.setItem(
            "customerAddress",
            address
        );

        localStorage.setItem(
            "paymentMethod",
            payment
        );


        // Remove cart

        localStorage.removeItem("cart");

        cart = [];


        // Go to success page

        window.location.href =
            "success.html";

    })

    .catch(function(error) {

        console.error(error);

        alert(
            "Unable to connect to C++ backend. Please start the backend."
        );
    });
}


// ========================================
// SUCCESS PAGE
// ========================================

function loadSuccessPage() {

    const successName =
        document.getElementById(
            "successName"
        );

    const successPayment =
        document.getElementById(
            "successPayment"
        );

    const successOrderId =
        document.getElementById(
            "orderId"
        );


    if (successName) {

        const name =
            localStorage.getItem(
                "customerName"
            );

        if (name) {

            successName.innerText =
                name;
        }
    }


    if (successPayment) {

        const payment =
            localStorage.getItem(
                "paymentMethod"
            );

        if (payment) {

            successPayment.innerText =
                payment;
        }
    }


    if (successOrderId) {

        const orderId =
            localStorage.getItem(
                "orderId"
            );

        if (orderId) {

            successOrderId.innerText =
                "#" + orderId;
        }
    }
}


// ========================================
// LOGIN / REGISTER
// ========================================

let registerMode = false;


// ========================================
// SWITCH LOGIN / REGISTER
// ========================================

function switchForm() {

    registerMode =
        !registerMode;


    const fields =
        document.querySelectorAll(
            ".register-field"
        );


    fields.forEach(function(field) {

        field.style.display =
            registerMode
                ? "block"
                : "none";
    });


    const formTitle =
        document.getElementById(
            "formTitle"
        );

    const formSubtitle =
        document.getElementById(
            "formSubtitle"
        );

    const loginButton =
        document.getElementById(
            "loginButton"
        );

    const switchMessage =
        document.getElementById(
            "switchMessage"
        );

    const switchButton =
        document.getElementById(
            "switchButton"
        );


    if (registerMode) {

        if (formTitle) {

            formTitle.innerText =
                "Create Account";
        }

        if (formSubtitle) {

            formSubtitle.innerText =
                "Create your Foodie account to continue.";
        }

        if (loginButton) {

            loginButton.innerText =
                "Register";
        }

        if (switchMessage) {

            switchMessage.innerText =
                "Already have an account?";
        }

        if (switchButton) {

            switchButton.innerText =
                "Login";
        }

    } else {

        if (formTitle) {

            formTitle.innerText =
                "Welcome Back!";
        }

        if (formSubtitle) {

            formSubtitle.innerText =
                "Login to continue ordering delicious food.";
        }

        if (loginButton) {

            loginButton.innerText =
                "Login";
        }

        if (switchMessage) {

            switchMessage.innerText =
                "Don't have an account?";
        }

        if (switchButton) {

            switchButton.innerText =
                "Create Account";
        }
    }
}


// ========================================
// SHOW PASSWORD
// ========================================

function showPassword() {

    const password =
        document.getElementById(
            "loginPassword"
        );

    if (!password) {
        return;
    }


    if (password.type === "password") {

        password.type = "text";

    } else {

        password.type = "password";
    }
}


// ========================================
// LOGIN / REGISTER BUTTON
// ========================================

function loginUser() {

    if (registerMode) {

        registerUser();

    } else {

        loginAccount();
    }
}


// ========================================
// LOGIN ACCOUNT
// ========================================

function loginAccount() {

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    if (
        email === "" ||
        password === ""
    ) {

        alert(
            "Please enter email and password."
        );

        return;
    }


    const data = {

        email: email,

        password: password
    };


    fetch(
        "http://localhost:8080/login",
        {
            method: "POST",

            headers: {
                "Content-Type": "text/plain"
            },

            body: JSON.stringify(data)
        }
    )

    .then(function(response) {

        return response.text();
    })

    .then(function(result) {

        if (
            result ===
            "Login successful!"
        ) {

            localStorage.setItem(
                "loggedIn",
                "true"
            );

            localStorage.setItem(
                "userEmail",
                email
            );


            alert(
                "Login successful!"
            );


            window.location.href =
                "index.html";

        } else {

            alert(
                "Invalid email or password."
            );
        }
    })

    .catch(function(error) {

        console.error(error);

        alert(
            "Unable to connect to C++ backend. Please start the backend."
        );
    });
}


// ========================================
// REGISTER USER
// ========================================

function registerUser() {

    const name =
        document.getElementById(
            "registerName"
        ).value.trim();

    const email =
        document.getElementById(
            "loginEmail"
        ).value.trim();

    const phone =
        document.getElementById(
            "registerPhone"
        ).value.trim();

    const password =
        document.getElementById(
            "loginPassword"
        ).value;

    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        ).value;


    if (
        name === "" ||
        email === "" ||
        phone === "" ||
        password === "" ||
        confirmPassword === ""
    ) {

        alert(
            "Please fill all fields."
        );

        return;
    }


    if (
        password !== confirmPassword
    ) {

        alert(
            "Passwords do not match."
        );

        return;
    }


    const data = {

        name: name,

        email: email,

        phone: phone,

        password: password
    };


    fetch(
        "http://localhost:8080/register",
        {
            method: "POST",

            headers: {
                "Content-Type": "text/plain"
            },

            body: JSON.stringify(data)
        }
    )

    .then(function(response) {

        return response.text();
    })

    .then(function(result) {

        alert(result);


        if (
            result ===
            "Registration successful!"
        ) {

            switchForm();
        }
    })

    .catch(function(error) {

        console.error(error);

        alert(
            "Unable to connect to C++ backend. Please start the backend."
        );
    });
}


// ========================================
// USER LOGIN STATUS
// ========================================

function checkLoginStatus() {

    const userSection =
        document.getElementById(
            "userSection"
        );


    if (!userSection) {
        return;
    }


    const loggedIn =
        localStorage.getItem(
            "loggedIn"
        );

    const email =
        localStorage.getItem(
            "userEmail"
        );


    if (
        loggedIn === "true" &&
        email
    ) {

        userSection.innerHTML = `

            <span class="user-name">
                👤 ${email}
            </span>

            <button
                onclick="logoutUser()"
                class="logout-btn">
                Logout
            </button>

        `;
    }
}


// ========================================
// LOGOUT
// ========================================

function logoutUser() {

    localStorage.removeItem(
        "loggedIn"
    );

    localStorage.removeItem(
        "userEmail"
    );


    alert(
        "You have been logged out!"
    );


    window.location.href =
        "index.html";
}


// ========================================
// HOME CATEGORY → MENU FILTER
// ========================================

function loadCategoryFromURL() {

    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const category =
        urlParams.get("category");


    if (category) {

        filterCategory(category);
    }
}


// ========================================
// PAGE LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        displayCart();

        displayCheckout();

        loadSuccessPage();

        checkLoginStatus();

        updateCartCount();

        loadCategoryFromURL();

    }
);