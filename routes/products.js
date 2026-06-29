const express = require("express");
const db = require("../db/db");

const router = express.Router();
const productRepository = require("../db/productRepository");

// Route for creating a new product
router.get("/create", (req, res) => {
  res.render("products/create", {
    title: "Create Product",
    product: req.body,
  });
});

router.post("/create", (req, res) => {
  const { name, description, price } = req.body;

  if (!name) {
    return res.render("products/create", {
      title: "Create Product",
      error: "Name is required.",
      product: req.body,
    });
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return res.render("products/create", {
      title: "Create Product",
      error: "Price must be numeric.",
      product: req.body,
    });
  }

  if (numericPrice <= 0) {
    return res.render("products/create", {
      title: "Create Product",
      error: "Price must be greater than zero.",
      product: req.body,
    });
  }

  productRepository.create(name, description, numericPrice);
//   res.redirect("/products?success=1");
  const db = require("../db/db");
  const result = db.prepare("SELECT last_insert_rowid() AS id").get();
  const newProductId = result.id;
  res.redirect(`/products/${newProductId}?success=1`);
});

// Route for displaying all products
router.get("/", (req, res) => {
  const sort = req.query.sort || "id";

  const allowed = ["id", "name", "price"];

  const column = allowed.includes(sort) ? sort : "id";

  const stmt = db.prepare(`
		  SELECT *
		  FROM products
		  ORDER BY ${column}
	  `);

  const products = stmt.all();

  const countStmt = db.prepare(`
	  SELECT COUNT(*) AS total
	  FROM products
  `);

  const result = countStmt.get();

  const success = req.query.success;
  res.render("products/list", {
    success,
    title: "Products",
    products,
    total: result.total,
  });
});

// Route for displaying a single product by ID
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).send("Invalid Product ID");
  }
  const product = productRepository.findById(req.params.id);

  if (!product) {
    return res.status(404).render("404", {
      title: "Not Found",
    });
  }

  const success = req.query.success;
  res.render("products/single", {
    title: product.name,
    id: product.id,
    product,
    success,
  });
});

module.exports = router;
