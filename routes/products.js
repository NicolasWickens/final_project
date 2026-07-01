const express = require("express");
const db = require("../db/db");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    const extension = file.originalname.split(".").pop();

    cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and WebP images are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

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
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.render("products/create", {
        title: "Create Product",
        error: "Invalid file",
        product: req.body,
      });
    }

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
    productRepository.saveProductImage(newProductId, req.file.filename);
    res.redirect(`/products/${newProductId}?success=1`);
  });
});

// Route for displaying all products
router.get("/", (req, res) => {
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
  // const products = productRepository.findPage(page, limit);

  res.render("products/list", {
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
  });
});

router.get("/delete_products", (req, res) => {
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
  let query = "SELECT * FROM products";
  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }
  if (conditions.length > 0) {
    query += " AND deleted_at IS NOT NULL";
  } else {
    query += " WHERE deleted_at IS NOT NULL";
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

  const totalRecords = products.length;
  const totalPages = Math.ceil(totalRecords / limit);

  res.render("products/deletedProducts", {
    title: "Deleted Products",
    total: totalRecords,
    page,
    totalPages,
    products: products,
    search,
    minPrice,
    nameAsc,
    priceAsc,
  });
});

router.get("/delete/:id", (req, res) => {
  const product = productRepository.findById(req.params.id);

  if (!product) {
    return res.status(404).render("404", { title: "Product not found" });
  }

  res.render("products/delete", {
    title: "Delete Product",
    product,
  });
});

router.post("/delete/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).send("Invalid ID");
  }
  const result = productRepository.deleteById(req.params.id);
  if (result.changes === 0) {
    return res.status(404).render("404", { title: "Product not found" });
  }
  res.redirect("/products");
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

  const productImages = productRepository.findProductImages(req.params.id);
  let imageUrl = [];
  for (const image of productImages) {
    imageUrl.push(`/uploads/${image.filename}`);
  }

  const success = req.query.success;
  res.render("products/single", {
    title: product.name,
    id: product.id,
    product,
    success,
    image: imageUrl,
  });
});

router.get("/edit/:id", (req, res) => {
  const product = productRepository.findById(req.params.id);

  if (!product) {
    return res.status(404).render("404", { title: "Product not found" });
  }

  const productImages = productRepository.findProductImages(req.params.id);
  let imageUrl = [];
  for (const image of productImages) {
    imageUrl.push(`/uploads/${image.filename}`);
  }

  res.render("products/edit", {
    title: "Edit Product",
    product,
    image: imageUrl,
  });
});

router.post("/edit/:id", (req, res) => {
  upload.single("image")(req, res, (err) => {
    const { name, description, price } = req.body;
    if (err) {
      const productImages = productRepository.findProductImages(req.params.id);
      let imageUrl = [];
      for (const image of productImages) {
        imageUrl.push(`/uploads/${image.filename}`);
      }
      return res.render("products/edit", {
        title: "Edit Product",
        error: "Invalid file",
        product: { id: req.params.id, name, description, price },
        image: imageUrl,
      });
    }

    if (!name) {
      const productImages = productRepository.findProductImages(req.params.id);
      let imageUrl = [];
      for (const image of productImages) {
        imageUrl.push(`/uploads/${image.filename}`);
      }
      return res.render("products/edit", {
        title: "Edit Product",
        error: "Name is required.",
        product: { id: req.params.id, name, description, price },
        image: imageUrl,
      });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      const productImages = productRepository.findProductImages(req.params.id);
      let imageUrl = [];
      for (const image of productImages) {
        imageUrl.push(`/uploads/${image.filename}`);
      }
      return res.render("products/edit", {
        title: "Edit Product",
        error: "Invalid price.",
        product: { id: req.params.id, name, description, price },
        image: imageUrl,
      });
    }

    const id = req.params.id;
    let result = productRepository.saveProductImage(id, req.file.filename);
    if (result.changes === 0) {
      return res.status(404).render("404", { title: "Product not found" });
    }
    result = productRepository.update(id, name, description, price);
    if (result.changes === 0) {
      return res.status(404).render("404", { title: "Product not found" });
    }

    res.redirect(`/products/${id}`);
  });
});

router.get("/restore/:id", (req, res) => {
  const product = productRepository.findDeletedById(req.params.id);

  if (!product) {
    return res.status(404).render("404", { title: "Product not found" });
  }

  res.render("products/restore", {
    title: "Restore Product",
    product,
  });
});

router.post("/restore/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).send("Invalid ID");
  }
  const result = productRepository.restoreById(req.params.id);
  if (result.changes === 0) {
    return res.status(404).render("404", { title: "Product not found" });
  }
  res.redirect("/products");
});

module.exports = router;
