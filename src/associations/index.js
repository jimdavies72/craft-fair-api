const Vendor = require("../vendor/vendorModel");
const User = require("../user/userModel");

//User - Vendor 1:1
Vendor.belongsTo(User);
User.hasOne(Vendor);

