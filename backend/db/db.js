import mongoose from "mongoose";

function connect(){
    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("connected to mongDB");
    }).catch(err=>{
        console.log(err);
    })
}
export default connect;