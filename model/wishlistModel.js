const mongoose = require("mongoose");
const Objectid = mongoose.Types.ObjectId;
const wishlistSchema = new mongoose.Schema({
  userId: {
    type: Objectid,
    ref: "User",
    require: true,
  },
  myWishlist: [
    {
      ProductId: {
        type: Objectid,
        ref: "ProductData",
      },
      name: String,
    },
  ],
});
module.exports = Wishlist = mongoose.model("Wishlist", wishlistSchema)