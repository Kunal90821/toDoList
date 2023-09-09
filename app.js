import express from "express";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();

app.set("view engine","ejs");

app.use(express.urlencoded({ extended : true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://kunalkumar:t8E36vjtS9WTX4Hv@cluster0.zyq4us2.mongodb.net/toDoList");

const itemSchema = {
    name : String,
};

const Item = mongoose.model("item",itemSchema);

const listSchema = {
    name : {
        type : String,
        unique : true,
    },
    items : [itemSchema],
};

const List = mongoose.model("list",listSchema);

const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const date = new Date();
const day = weekday[date.getDay()];

app.get("/",(req,res)=>{
    Item.find().then((foundItems)=>{
        if(foundItems.length === 0){
            res.render("list",{ listTitle : day});
        }
        else {
            res.render("list",{ listTitle : day, items : foundItems});
        }
    });
});

app.get("/:customListName",(req,res)=>{
    
    const customListName = _.capitalize(req.params.customListName);
    if(customListName !== "Favicon.ico"){
        List.findOne({ name : customListName}).then((foundList)=>{
        if(!foundList){
            const list = new List({
                name : customListName,
            });
            list.save();
            res.redirect("/" + customListName);
        }
        else {
            res.render("list",{ listTitle : foundList.name, items : foundList.items });
        }
    });
    }
    else {
        res.redirect("/");
    }
});

app.post("/",(req,res)=>{
    const newItem = req.body["newItem"];
    const listName = req.body["list"];

    const item = new Item({
        name : newItem,
    });

    if(listName === day){
        item.save();
        res.redirect("/");
    }
    else {
        List.findOne({ name : listName}).then((foundList)=>{
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete",(req,res)=>{
    const checkedItemId = req.body["checkbox"];
    const listName = req.body["listName"];

    if(listName === day){
        Item.findByIdAndRemove(checkedItemId).then(()=>{});
        res.redirect("/");
    }
    else {
        List.findOneAndUpdate({ name : listName },{$pull : {items : {_id : checkedItemId }}}).then((foundList)=>{
            res.redirect("/" + listName);
        });
    }
});

let port = process.env.PORT;
if(port == null || port == "") {
    port = 3000;
}
app.listen(port,()=>{console.log(`Server has started successfully.`)});
