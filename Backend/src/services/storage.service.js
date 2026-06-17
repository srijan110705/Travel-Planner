const {ImageKit}=require("@imagekit/nodejs/index.js");

const ImageKitClient=new ImageKit({
    privateKey:process.env.IMAGEKIT_PRIVATE_KEY
})

module.exports={};