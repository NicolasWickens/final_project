const express = require("express");

const app = express();

const bcrypt = require("bcrypt");

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

// for static files like CSS, JS, images, etc.
app.use(express.static("public"));

//configuring ejs
const path = require("node:path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const session = require("express-session");
const { loadEnvFile } = require("node:process");
loadEnvFile();

// const products = [
//   {
//     id: 1,
//     name: "Keyboard",
//     price: 49.99,
//   },
//   {
//     id: 2,
//     name: "Mouse",
//     price: 19.99,
//   },
//   {
//     id: 3,
//     name: "Monitor",
//     price: 199.99,
//   },
//   {
//     id: 4,
//     name: "Mousepad",
//     price: 19.99,
//   },
//   {
//     id: 5,
//     name: "Headphones",
//     price: 199.99,
//   },
// ];

// app.get("/", (req, res) => {
//   res.render("index", {
//     title: "Products",
//     products,
//   });
// });

// app.get("/layout", (req, res) => {
//   res.render("layout", {
//     title: "This is the layout page",
//     products,
//   });
// });

// app.get("/about", (req, res) => {
//   res.send("About Page");
// });

//homework day2
// function homework_day2() {
//   app.get("/products", (req, res) => {
//     res.render("products", {
//       title: "Products",
//       products,
//     });
//   });

//   app.get("/products/:id", (req, res) => {
//     const productId = parseInt(req.params.id);
//     res.send(`Product ID: ${productId}`);
//   });

//   app.get("/products/create", (req, res) => {
//     res.send("Create Product Page");
//   });

//   app.get("/products/edit/:id", (req, res) => {
//     const productId = parseInt(req.params.id);
//     res.send(`Edit Product ID: ${productId}`);
//   });
// }
// homework_day2();

const expressLayouts = require("express-ejs-layouts");
const productsRouter = require("./routes/products");
const userRepository = require("./db/userRepository");
const productRepository = require("./db/productRepository");
const usersRouter = require("./routes/users");


app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
// Use Session Middleware:
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  next();
});
app.use(function provideUserInfo(req, res, next) {
  if (req.session.userId) {
    req.user = userRepository.findById(req.session.userId);
  }
  next();
});
app.use("/products", productsRouter);
app.use("/users", usersRouter);

app.get("/login", (req, res) => {
  res.render("login", {
    title: "Login",
  });
});
app.post("/login",  async (req, res) => {
  const { email, password } = req.body;
  const user = userRepository.findByEmail(email);

  if (!user) {
    return res.send("User not found");
  }

  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.send("Unauthorized access");
  }

  req.session.userId = user.id;
  if (user.role === "admin") {
    res.redirect("/admin");
  } else {
    res.redirect("/products");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
    email: "",
  });
});

app.post("/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render("register", {
      title: "Register",
      error: "Passwords do not match",
      email,
    });
  }

  const existingUser = userRepository.findByEmail(email);
  if (existingUser) {
    return res.render("register", {
      title: "Register",
      error: "Email already exists",
      email,
    });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  userRepository.createUser(email, passwordHash);

  res.redirect("/login");
});

const db = require("./db/db");

app.get("/admin", productRepository.requireRole("viewer"), (req, res) => {
  const sort = req.query.sort || "id";

  const allowed = ["id", "name", "price"];

  const column = allowed.includes(sort) ? sort : "id";

  let page = Number(req.query.page) || 1;
  const limit = 10;
  const search = req.query.search || "";
  const minPrice = Number(req.query.minPrice) || 0;
  const nameAsc = req.query.nameAsc === "true";
  const priceAsc = req.query.priceAsc === "true";

  const conditions = [];
  const values = [];
  if (search !== "") {
    conditions.push("(name LIKE ? OR description LIKE ?)");
    const searchTerm = `%${search}%`;
    values.push(searchTerm, searchTerm);
  }
  if (minPrice > 0) {
    conditions.push("price >= ?");
    values.push(minPrice);
  }
  const totalRecords = productRepository.count(conditions, values);
  const totalPages = Math.ceil(totalRecords / limit);
  if (!Number.isInteger(page) || page < 1) {
    page = 1;
  }
  if (page > totalPages) {
    page = totalPages;
  }
  let query = "SELECT * FROM products";
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  if (conditions.length > 0) {
    query += " AND deleted_at IS NULL";
  } else {
    query += " WHERE deleted_at IS NULL";
  }
  if (nameAsc) {
    query += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
  } else if (priceAsc) {
    query += ` ORDER BY price ASC LIMIT ? OFFSET ?`;
  } else {
    query += ` ORDER BY ${column} DESC LIMIT ? OFFSET ?`;
  }
  values.push(limit, (page - 1) * limit);
  const stmt = db.prepare(query);
  const products = stmt.all(...values);
  const success = req.query.success;
  const users = userRepository.findAllUsers();
  // const products = productRepository.findPage(page, limit);
  res.render("admin", {
    success,
    title: "Products",
    total: totalRecords,
    page,
    totalPages,
    products: products,
    search,
    minPrice,
    nameAsc,
    priceAsc,
    user: req.user,
    users,
  });
});
