import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "todaylist",
  password: "Facebook@1997",
  port: 5432
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function getListItems() {
  const data = await db.query("SELECT * FROM items ORDER BY id ASC;");
  console.log("Rows are: ", data.rows);
  return data.rows;
}

app.get("/", async (req, res) => {
  let items = [];
  const listData = await getListItems();
  listData.forEach((item) => {
    items.push(item);
  });
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  await db.query("INSERT INTO items (title) VALUES ($1);", [item]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const itemId = req.body.updatedItemId;
  const itemName = req.body.updatedItemTitle;
  // console.log("Updated item id and title are: ", itemId, itemName);
  await db.query("UPDATE items SET title = $1 WHERE id = $2;", [itemName, itemId]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  console.log("Delete id: ", id);
  await db.query("DELETE FROM items WHERE id = $1;", [id]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
