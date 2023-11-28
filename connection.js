import { MongoClient } from "mongodb";

let con;
const url = "mongodb+srv://Zarif_Mustafa:p_202114107@cluster0.8le4rjx.mongodb.net/?retryWrites=true&w=majority";

function connectKorbe(callBack) {
    MongoClient.connect(url)
        .then((client) => {
            con = client.db("BookCycle");
            return callBack();
        })
        .catch((err) => {
            return callBack(err); // Fix: Use callBack instead of callback
        });
}

const getConnection = () => con;

export { connectKorbe, getConnection };
