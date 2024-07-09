import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function getListItems() {
  try {
    const data = await db.query("SELECT * FROM items ORDER BY id ASC;");
    return data.rows;
  } catch (error) {
    console.log(error);
  }
  // console.log("Rows are: ", data.rows);
}

const currentDate = new Date();

const options = { 
  weekday: 'long', 
  day: 'numeric', 
  month: 'long'
};

const day = currentDate.toLocaleDateString('en-US', options);

app.get("/", async (req, res) => {
  let items = [];
  const listData = await getListItems();
  listData.forEach((item) => {
    items.push(item);
  });
  res.render("index.ejs", {
    listTitle: day,
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("INSERT INTO items (title) VALUES ($1);", [item]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/edit", async (req, res) => {
  const itemId = req.body.updatedItemId;
  const itemName = req.body.updatedItemTitle;
  // console.log("Updated item id and title are: ", itemId, itemName);
  try {
    await db.query("UPDATE items SET title = $1 WHERE id = $2;", [itemName, itemId]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  // console.log("Delete id: ", id);
  try {
    await db.query("DELETE FROM items WHERE id = $1;", [id]);
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
