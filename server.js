import express from 'express';
import cors from 'cors';
import {connectKorbe, getConnection} from "./connection.js"
const app= express();
import {ObjectId} from "mongodb";
const port=5000;
let db;

app.use(cors());
app.use(express.json());

connectKorbe(function(err){
    if(!err){
        app.listen(port);
        db=getConnection();
        console.log("server running on port", port);
    }
    else{
        console.error('Database Connection Error Zarif');
    }
});


app.get("/getusers", function(req, res) {

    let users=[];
    db.collection('user').find().forEach(element => {
        users.push(element);
    }).then(function(){
        res.json(users);
    }).catch(function(err){
        res.json('Error hoye gese');
    })
})

// app.get("/getusers/:email", function(req, res) {
//     const email=req.params.email;

//     db.collection('user').findOne({email: email},{projection:{password:1,_id:0}}).then(function(data){
//         res.json(data);
//     }).catch(function(err){
//         res.json('Error hoye gese');
//     })
// })
app.get("/getusers/:email", function(req, res) {
    const email = req.params.email; // Get the email from the URL parameter

    db.collection('user').findOne(
        { email: email }, // Search for a document with the specified email
        { _id: 0 } // Exclude the _id field (if desired)
    ).then(function(data) {
        if (data) {
            res.json(data); // Send the entire user document as a JSON response
        } else {
            res.status(404).json('User not found'); // Send a 404 response if the user is not found
        }
    }).catch(function(err) {
        res.status(500).json('Error hoye gese'); // Send a 500 response in case of an error
    });
});




app.post("/insertuser", function(req, res) {
    const user=req.body;
    db.collection('user').insertOne(user).then(function(result){
        res.json(result);
    }).catch(function(err){
        res.json('Error hoye gese');
    })
})


app.get("/searchByTitle", function(req, res) {
    const title = req.query.title; // Get the title from the query parameter

    const find = {};

    if(title) find["title"]=title;

    db.collection('books').find(find).toArray()
        .then(function(data) {
            if (data.length > 0) {
                res.json(data); // Send the matching books as a JSON response
            } else {
                res.status(404).json('No books found with the given title'); // Send a 404 response if no matching books are found
            }
        })
        .catch(function(err) {
            res.status(500).json('Error occurred while searching'); // Send a 500 response in case of an error
        });
});
  
  
app.put("/api/update-profile", async function(req, res) {
    try {
        const updatedUser = req.body;
        const _id = updatedUser._id // Assuming you're updating based on _id

        // Filter out properties with empty values
        const validUpdate = {};
        Object.keys(updatedUser).forEach(key => {
            if (updatedUser[key] !== '') {
                validUpdate[key] = updatedUser[key];
            }
        });

        delete validUpdate._id;
        console.log(validUpdate);

        const result = await db.collection('user').findOneAndUpdate(
           { _id: new ObjectId(_id) },
            {$set: validUpdate },
        );
            console.log("result",result);
        res.json(result); // Send back the updated user
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error hoye gese', error: err });
    }
});

app.get("/",(req,res)=>{
    res.send("Hello World");
})


app.get("/api/get-user/:id", function(req, res) {
    const userId = req.params.id;

    // Validate if the provided ID is a valid MongoDB ObjectId
    if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    const filter = { _id: new ObjectId(userId) };

    db.collection('user').findOne(filter)
        .then(function(user) {
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).json({ message: 'Error occurred while fetching user', err });
        });
});



