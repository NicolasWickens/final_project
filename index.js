const express = require("express");

const app = express();

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

// for static files like CSS, JS, images, etc.
app.use(express.static("public"));

//configuring ejs
const path = require("node:path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const products = [
  {
    id: 1,
    name: "Keyboard",
    price: 49.99,
  },
  {
    id: 2,
    name: "Mouse",
    price: 19.99,
  },
  {
    id: 3,
    name: "Monitor",
    price: 199.99,
  },
  {
    id: 4,
    name: "Mousepad",
    price: 19.99,
  },
  {
    id: 5,
    name: "Headphones",
    price: 199.99,
  },
];

app.get("/", (req, res) => {
  res.render("index", {
    title: "Products",
    products,
  });
});

app.get("/layout", (req, res) => {
  res.render("layout", {
    title: "This is the layout page",
    products,
  });
});

app.get("/about", (req, res) => {
  res.send("About Page");
});

//homework day2
function homework_day2(){
	app.get ("/products", (req, res) => {
	  res.render("products", {
		title: "Products",
		products,
	  });
	});

	app.get("/products/:id", (req, res) => {
	  const productId = parseInt(req.params.id);
	  res.send(`Product ID: ${productId}`);
	});

	app.get("/products/create", (req, res) => {
	  res.send("Create Product Page");
	});

	app.get("/products/edit/:id", (req, res) => {
	  const productId = parseInt(req.params.id);
	  res.send(`Edit Product ID: ${productId}`);
	});
}
homework_day2();


const expressLayouts = require("express-ejs-layouts");

app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
