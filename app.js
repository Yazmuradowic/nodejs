const express = require("express");
const lodash = require("lodash");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("umumy"));
mongoose.connect("mongodb://localhost:27017/todolistDB");
const port = 3000;
const itemSchema = {
    name: {
        type: String,
        required: true  // Ensure that the name field is required
    }
};
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
    name: "Buy Food"
});
const item2 = new Item({
    name: "Cook Food"
});
const item3 = new Item({
    name: "Eat Food"
});
const defaultItems = [item1, item2, item3];
const tazelist = {
    name: String,
    items: [itemSchema]
};
const List = mongoose.model("List", tazelist);
app.get('/', (req, res) => {
    Item.find({})
        .then((foundItems) => {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems)
                    .then(() => {
                        console.log("Items database gosuldy.");
                        res.redirect('/');
                    })
                    .catch((err) => {
                        console.error("Error adding default items:", err);
                    });

            } else {
                res.render('list', { gun: "Today", tazeis: foundItems });
            }
        })
        .catch((err) => {
            console.error("Error retrieving items:", err);
            res.status(500).send("Internal Server Error");
        });
});
app.get("/:tazesahypa", function (req, res) {
    const list = new List({ name: req.params.tazesahypa, items: defaultItems });
    List.findOne({ name: req.params.tazesahypa })
        .then((foundList) => {
            if (foundList) {
                // If the list already exists, render it
                res.render("list", { gun: foundList.name, tazeis: foundList.items });
            } else {
                // If the list does not exist, create a new one
                list.save()
                    .then(() => {
                        res.redirect("/" + req.params.tazesahypa);
                        console.log("New list created.");
                    })
                    .catch((err) => {
                        console.error("Error creating new list:", err);
                    });
            }
        })
        .catch((err) => {
            console.error("Error creating or retrieving list:", err);
            res.status(500).send("Internal Server Error");
        });
});
app.post('/', (req, res) => {
    let itemname = req.body.etmeli;
    let listName = req.body.listbutton;
    const newitem = new Item({
        name: itemname
    });
    if (listName === "Today") {
        newitem.save()
            .then(() => {
                console.log("Item added to database.");
                res.redirect('/');
            })
            .catch((err) => {
                console.error("Error adding item:", err);
                res.render('error', { yalnys: err.message });

            });
    } else {
        List.findOne({ name: listName })
            .then((foundList) => {
                foundList.items.push(newitem);
                foundList.save()
                    .then(() => {
                        // console.log("Item added to list.");
                        res.redirect('/' + listName);
                    })
                    .catch((err) => {
                        console.error("Error saving item to list:", err);
                        res.render('error', { yalnys: err.message });
                    });
            })
            .catch((err) => {
                console.error("Error finding list:", err);
                res.status(500).send("Internal Server Error");
            });
    }
});
app.post('/delete', (req, res) => {
    const saylananID = req.body.saylanan;
    const listName = req.body.listName;
    if (listName === "Today") {
        Item.findByIdAndDelete(saylananID)
            .then(() => {
                console.log("Item deleted from database.");
                res.redirect('/');
            })
            .catch((err) => {
                console.error("Error deleting item:", err);
                res.status(500).send("Internal Server Error");
            });
    } else {
        List.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: saylananID } } },
            { new: true }
        )
            .then(() => {
                console.log("Item deleted from custom list.");
                res.redirect('/' + listName);
            })
            .catch((err) => {
                console.error("Error deleting item from custom list:", err);
                res.status(500).send("Internal Server Error");
            });
    }
});
app.post('/bas', (req, res) => {
    res.redirect('/');
});
app.get('/about', (req, res) => {
    res.render('about');
});
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${port}`);
});