let mongoose=require('mongoose')
require('dotenv').config()


exports.dbConnection=()=>{
let DBURL=process.env.DBURL
console.log(DBURL)
mongoose.connect(DBURL)
.then(()=>{console.log('mongodb connected')})
.catch((e)=>{console.log('mongodb is not connect error: ',e)})

}