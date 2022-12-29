const CategoryModel = require("../model/categoryModel");
const ApplienceModel = require("../model/applienceModel");
const ProductModel = require("../model/productModel");
const wishlistModel = require("../model/wishlistModel");
const cartModel = require("../model/cartModel");
const userModel = require("../model/userModel");
const UserModel = require("../model/userModel");
const couponModel=require('../model/couponModel')
const orderModel = require("../model/orderModel");
const express = require("express");
const app = express.Router();
const addressModel = require("../model/addressModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { session } = require("passport");
const productModel = require("../model/productModel");
const { response } = require("express");
const applienceModel = require("../model/applienceModel");
const Razorpay=require('razorpay')
const crypto=require('crypto');
const { log } = require("console");

//----------------------------------------- START OTP ----------------------------------------------------------
// Email OTP Verification

var firstname;
var lastname;
var Email;
var Phone;
var Repassword;
var Password;

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "Gmail",

  auth: {
    user: "homeelectrokerala@gmail.com",
    pass: "jocbxjifgwwayqhm",
  },
});

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);


let instance = new Razorpay({
  key_id: "rzp_test_filNO2IPOu8MkQ",
  key_secret: "OsyZNzqD3yBbJKKj6IeOmfxK",
});

//**************************************** END OTP **************************************************//

module.exports = {
  //user home
  homeView: async (req, res) => {
    let user = req.session.userLogin;
    const products = await productModel.find();
    const applience = await ApplienceModel.find();
    const category = await CategoryModel.find();
    let userId = req.session.userId;
    const cartView = await cartModel.findOne({ userId });
    const featuredProducts= await ProductModel.find().limit(8)
   const coupons= await couponModel.find()
   console.log(coupons);
    if (cartView) {
      let cartLength = cartView.products.length;
      res.render("user/home", {
        user,
        name: req.session.user,
        applience,
        products,
        category,
        cartLength,
        featuredProducts,
        coupons
      });
    } else {
      let cartLength = 0;
      res.render("user/home", {
        user,
        name: req.session.user,
        applience,
        products,
        category,
        cartLength,
        featuredProducts,
        coupons
      });
    }
  },

  userHome: (req, res) => {
    res.redirect("/");
  },
  //user login
  userlogin: (req, res) => {
    if (req.session.userLogin) {
      res.redirect("/");
    } else {
      res.render("user/userlogin", {
        userStatus: req.session.userErr,
        passwordStatus: req.session.passwordErr,
      });
      req.session.userErr = false;
      req.session.passwordErr = false;
    }
  },
  //**********************************SIGNUP USER *******************************************/
  userSignup: (req, res) => {
    res.render("user/usersignup", { repass: req.session.repass });
    req.session.repass = false;
  },

  otpVerifi: (req, res) => {
    firstname = req.body.firstname;
    lastname = req.body.lastname;

    Email = req.body.email;
    Phone = req.body.phone;
    (Password = req.body.password), (Repassword = req.body.repassword);
    console.log(Repassword);

    //check the password and repassword
    if (Repassword === Password) {
      // email send to the user
      const user = UserModel.findOne({ email: Email }, (err, data) => {
        if (!data) {
          // send mail with defined transport object
          var mailOptions = {
            to: req.body.email,
            subject: "Otp for registration is: ",
            html:
              "<h3>OTP for account verification is </h3>" +
              "<h1 style='font-weight:bold;'>" +
              otp +
              "</h1>", // html body
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

            res.render("user/verificationEmail");
          });
        } else {
          res.redirect("/signin");
        }
      });
      console.log(user);
    } else {
      req.session.repass = true;
      res.redirect("/signup");
    }
    console.log(req.body);
  },
  //resend otp
  resendotp: (req, res) => {
    var mailOptions = {
      to: Email,
      subject: "Otp for registration is: ",
      html:
        "<h3>OTP for account verification is </h3>" +
        "<h1 style='font-weight:bold;'>" +
        otp +
        "</h1>", // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      res.render("user/otp", { msg: "otp has been sent" });
    });
  },
  //verifying the entered otp
  verifyotp: (req, res) => {
    console.log(otp);
    if (req.body.otp == otp) {
      const newUser = UserModel({
        firstName: firstname,
        lastName: lastname,
        email: Email,
        password: Password,
      });
      console.log(req.body);
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;

          newUser
            .save()
            .then(() => {
              res.redirect("/signin");
            })
            .catch((err) => {
              console.log(err);
              res.redirect("/signin");
            });
        });
      });
    } else {
      res.redirect("/");
    }
  },
  //shop view products
  shopView: async (req, res) => {
    const pageNum = Number(req.query.page);
    const perPage = 9;

    let docCount;
    let userId = req.session.userId;
    const cartView = await cartModel.findOne({ userId });
    if (cartView) {
      var cartLength = cartView.products.length;
    } else {
      var cartLength = 0;
    }

    let user = req.session.userLogin;

    const category = await CategoryModel.find();
    const applience = await ApplienceModel.find();
    const products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience")
      .countDocuments()
      .then((documents) => {
        docCount = documents;
        return ProductModel.find({})
          .populate("Category")
          .populate("Applience")
          .skip((pageNum - 1) * perPage)
          .limit(perPage);
      });
      let userWishlist= await wishlistModel.findOne({userId:userId})
      console.log(userWishlist,'userWishlist');
      for (let i = 0; i < products.length; i++) {
        for (let j = 0; j < userWishlist.length; j++) {
            if (userWishlist.myWishlist[j].ProductId == products[i]._id) {
                products[i].fav = true;
            }
        }
    }
    
    

    res.render("user/shopView", {
      user,
      name: req.session.user,
      applience,
      products,
      category,
      cartLength,
      currentPage: pageNum,
      totalDocuments: docCount,
      pages: Math.ceil(docCount / perPage),
      
    });
  },

  //filter the products
  filtering: async (req, res) => {
    const pageNum = Number(req.query.page);
    const perPage1 = 10;

    let docCount;

    let userId = req.session.userId;
    const cartView = await cartModel.findOne({ userId });
    if (cartView) {
      var cartLength = cartView.products.length;
    } else {
      var cartLength = 0;
    }

    let user = req.session.userLogin;
    const category = await CategoryModel.find();
    const applience = await ApplienceModel.find();
    let products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience")
      .countDocuments()
      .then((documents) => {
        docCount = documents;
        return ProductModel.find({})
          .populate("Category")
          .populate("Applience")
          .skip((pageNum - 1) * perPage1)
          .limit(perPage1);
      });

    let product = await ProductModel.find({});

    const data = req.body;

    if (data.Category) {
      if (Array.isArray(data.Category)) {
        products = products.filter((obj) => {
          if (data.Category.includes(obj.Category.Category)) {
            console.log("loo1");

            return obj;
          }
        });
      } else {
        products = products.filter((obj) => {
          if (data.Category === obj.Category.Category) {
            console.log("loo2");
            return obj;
          }
        });
      }
    }
    if (data.Applience) {
      if (Array.isArray(data.Applience)) {
        products = products.filter((obj) => {
          if (data.Applience.includes(obj.Applience.Applience)) {
            console.log("loo1");

            return obj;
          }
        });
      } else {
        products = products.filter((obj) => {
          if (data.Applience === obj.Applience.Applience) {
            return obj;
          }
        });
      }
    }

    if (data.Price) {
      if (Array.isArray(data.Price)) {
        console.log(data.Price);
        var largest = 0;

        for (i = 0; i < data.Price.length; i++) {
          if (data.Price[i] > largest) {
            largest = data.Price[i];
          }
        }
        console.log(largest);

        products = products.filter((obj) => {
          // console.log(obj.Price);
          if (largest >= obj.Price) {
            console.log("loo2");
            return obj;
          }
        });
      } else {
        products = products.filter((obj) => {
          // console.log(obj.Price);
          if (data.Price >= obj.Price) {
            console.log("loo2");
            return obj;
          }
        });
      }
    }
    if (products == "") {
      res.render("user/filterView", {
        user,
        name: req.session.user,
        applience,
        products,
        category,
        cartLength,
        currentPage: pageNum,
        totalDocuments: docCount,
        pages: Math.ceil(docCount / perPage1),
        productsDetail: false,
      });
    } else {
      res.render("user/filterView", {
        user,
        name: req.session.user,
        applience,
        products,
        category,
        cartLength,
        currentPage: pageNum,
        totalDocuments: docCount,
        pages: Math.ceil(docCount / perPage1),
        productsDetail: true,
      });
    }
  },
  //login of the user
  doLogin: async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({
      $and: [{ email: email }, { status: "Unblocked" }],
    });
    if (!user) {
      req.session.userErr = true;
      return res.redirect("/signin");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.session.passwordErr = true;
      return res.redirect("/signin");
    }
    req.session.user = user.firstName;
    req.session.userId = user._id;
    req.session.userLogin = true;
    res.redirect("/");
    // console.log(req.body);
  },
  //user logout
  userLogout: (req, res) => {
    req.session.loggedOut = true;
    req.session.destroy();
    res.redirect("/");
  },
  //single product page
  singleProductpage: async (req, res) => {
    let productId = req.params.id;
    console.log(productId);

    let userId = req.session.userId;
    const cartView = await cartModel.findOne({ userId });
    if (cartView) {
      var cartLength = cartView.products.length;
    } else {
      var cartLength = 0;
    }

    const products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience");
    const product = await ProductModel.findById({ _id: req.params.id })
      .populate("Category")
      .populate("Applience");
    let user = req.session.userLogin;
    const applience = await ApplienceModel.find();
    const category = await CategoryModel.find();
    res.render("user/singleProduct", {
      product,
      name: req.session.user,
      products,
      user,
      applience,
      category,
      cartLength,
    });
  },
  //category product page
  categoryproductPage: async (req, res) => {
    let user = req.session.userLogin;
    const id = req.params.id;
    const category = await CategoryModel.find();
    const applience = await applienceModel.find();
    const products = await ProductModel.find({
      $or: [{ Category: id }, { Applience: id }],
    })
      .populate("Category")
      .populate("Applience");

    let userId = req.session.userId;
    const cartView = await cartModel.findOne({ userId });
    if (cartView) {
      var cartLength = cartView.products.length;
    } else {
      var cartLength = 0;
    }

    res.render("user/categoryproductPage", {
      user,
      name: req.session.user,
      applience,
      products,
      category,
      cartLength,
    });
  },

  //wishlist page
  wishlistPage: async (req, res) => {
    let user = req.session.userLogin;

    let userId = req.session.userId;
    const category = await CategoryModel.find();
    const applience = await applienceModel.find();
    const products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience");
    const cartView = await cartModel.findOne({ userId });
    if (cartView) {
      var cartLength = cartView.products.length;
    } else {
      var cartLength = 0;
    }

    try {
      let userId = req.session.userId;
      const wishView = await wishlistModel
        .findOne({ userId })
        .populate("myWishlist.ProductId")
        .exec();
      if (wishView) {
        req.session.wishNum = wishView.myWishlist.length;
      }
      wishNum = req.session.wishNum;
      console.log(wishView, "wishView");

      cartNum = req.session.cartNum;

      res.render("user/wishlist", {
        user,
        name: req.session.user,
        applience,
        products,
        category,
        cartLength,
        wishNum,
        wishProducts: wishView,
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  //add product to wish list
  addtoWishlist: async (req, res) => {
    try {
      let userId = req.session.userId;
      console.log(userId);
      console.log(req.body);
      let name = req.body.name;
      let ProductId = req.params.id;
      console.log(ProductId);
      let list = await wishlistModel.findOne({ userId: userId });
      console.log(list, "list");
      if (list) {
        let itemIndex = list.myWishlist.findIndex(
          (p) => p.ProductId == ProductId
        );
        console.log(itemIndex, "itemIndex");
        if (itemIndex > -1) {
          console.log("hi");
          // list.myWishlist.splice(itemIndex, 1);
        } else {
          list.myWishlist.push({ ProductId, name });
        }
        await list.save();
      } else {
        list = new wishlistModel({
          userId: userId,
          myWishlist: [{ ProductId, name }],
        });
        console.log(list, "list");
        await list.save();
        res.redirect("/");

        console.log("wishlist first added");
      }
    } catch (error) {
      console.log(error.message, "error from wishlist");
    }
  },
  //remove Wishlist
  removeWishlist: async (req, res) => {
    let userWishlist = await wishlistModel.findOne({
      userId: req.session.userId,
    });
    let wishlistIndex = userWishlist.myWishlist.findIndex(
      (prod) => (prod._id = req.params.id)
    );
    if (wishlistIndex != null) {
      userWishlist.myWishlist.splice(wishlistIndex, 1);
      await userWishlist.save();
      res.redirect("/userWishlist");
    } else {
      res.redirect("/");
    }
  },

  //add to cart

  addtoCart: async (req, res) => {
    try {
      let User = req.session.user;
      console.log(User, "user");
      let quantity = 1;
      let name = req.body.name;
      let price = req.body.price;
      const productId = req.params.id;
      const findProduct = await productModel.findById(productId);
      const userId = req.session.userId;
      let cart = await cartModel.findOne({ userId });
      console.log(cart, "cart");
      if (cart) {
        let itemIndex = cart.products.findIndex(
          (p) => p.productId == productId
        );
        if (itemIndex > -1) {
          console.log("a");
          let productItem = cart.products[itemIndex];
          productItem.quantity += quantity;
        } else {
          console.log("mar");
          cart.products.push({ productId, quantity, name, price });
        }
        cart.total = cart.products.reduce((acc, curr) => {
          return acc + curr.quantity * curr.price;
        }, 0);
        console.log(cart.total, "cart.total ");
        await cart.save();
        res.redirect("/shoping-cart");

        console.log(itemIndex, "itemindex");
      } else {
        const total = quantity * price;
        cart = new cartModel({
          userId: userId,
          products: [{ productId, quantity, name, price }],
          total: total,
        });
        await cart.save();
        res.redirect("/shoping-cart");
      }
    } catch (error) {
      console.log(error.message, "erro");
      app.use((req, res) => {
        res.status(429).render("admin/error-429");
      });
    }
  },

  //cart page

  cartPage: async (req, res) => {
    let userId = req.session.userId;
    const cartView = await cartModel.findOne({ userId });
    if (cartView) {
      var cartLength = cartView.products.length;
    } else {
      var cartLength = 0;
    }

    let user = req.session.userLogin;
    const category = await CategoryModel.find();
    const applience = await applienceModel.find();
    const products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience");

    try {
      let userId = req.session.userId;
      const cartView = await cartModel
        .findOne({ userId })
        .populate("products.productId")
        .exec();
      console.log(cartView, "cartView");
      if (cartView) {
        req.session.cartNum = cartView.products.length;
      }
      cartNum = req.session.cartNum;
      let data=await userModel.findById({_id:userId})
      console.log(data,'dataaaa');
      let applayCoupon=data.applyCoupon
      console.log(applayCoupon,'applayCoupon');
      console.log(data.usedCoupon,"used");
      const usedCouponlen = data.usedCoupon.length -1
      const usedCoupon = data.usedCoupon[usedCouponlen]
      res.render("user/cart", {
        user,
        name: req.session.user,
        applience,
        products,
        category,
        cartNum,
        cartProducts: cartView,
        cartLength,usedCoupon,
        applayCoupon

      });
    } catch (error) {
      console.log(error.message);
    }
  },

  cart_quantity:(req,res)=>{
    let newVal=req.body.newVal
    let stat=req.body.stat

    if(stat==1){

    }
    console.log(stat,'data');
    console.log(newVal,'newVal');

  },

  //remove cart Products
  removeCart: async (req, res) => {
    let userCart = await cartModel.findOne({ userId: req.session.userId });
    let productIndex = userCart.products.findIndex(
      (product) => product._id == req.params.id
    );

    console.log(productIndex, "productIndex");
    let productItem = userCart.products[productIndex];
    if (productIndex != null) {
      userCart.total =
        userCart.total - productItem.price * productItem.quantity;
      userCart.products.splice(productIndex, 1);
      await userCart.save();
      res.redirect("/userCartpage");
    } else {
      res.redirect("/");
    }
  },
  userProfilePage: async (req, res) => {
    let userId = req.session.userId;
    console.log(userId);
    const cartView = await cartModel.findOne({ userId });
    const userDetails = await userModel.findOne({ userId });
    const category = await CategoryModel.find();
    const applience = await applienceModel.find();
    const products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience");
    let user = req.session.userLogin;
    if (cartView) {
      var cartLength = cartView.products.length;
    } else {
      var cartLength = 0;
    }
    let phone = userDetails.phone;
    let address = userDetails.Address;
    console.log(phone, "phone");
    console.log(address, "address");
    if (address.length === 0) {
      res.render("user/userProfile", {
        user,
        name: req.session.user,
        applience,
        products,
        userDetails,
        category,
        cartLength,
        address: false,
        phone,
      });
    } else {
      res.render("user/userProfile", {
        user,
        name: req.session.user,
        applience,
        products,
        userDetails,
        category,
        cartLength,
        address: true,
        phone,
        phone,
      });
    }
  },
  addAddress: async (req, res) => {
    try {
      const userAddress = req.body;
      console.log(userAddress);
      const userId = req.session.userId;
      console.log(userId);
      await UserModel.findByIdAndUpdate(
        { _id: userId },
        {
          $push: {
            Address: {
              firstName: userAddress.firstName,
              lastName: userAddress.lastName,
              mobileNo: userAddress.mobileNo,
              address: userAddress.address,
              city: userAddress.city,
              locality: userAddress.locality,
              landmark: userAddress.landmark,
              pinCode: userAddress.pinCode,
            },
          },
        }
      );
      res.redirect("/addressManage");
    } catch (error) {
      console.log(error.message);
    }
  },
  profileChange: async (req, res) => {
    let changeData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
    };

    let userId = req.session.userId;
    let data = await userModel.findOne({ userId });

    let profiledata = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
    };

    if (JSON.stringify(changeData) === JSON.stringify(profiledata)) {
      req.session.changes = true;
      res.redirect("/userProfile");
    } else {
      req.session.changes = false;
      await userModel.findByIdAndUpdate(
        { _id: userId },
        {
          $set: {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
          },
        }
      );

      res.redirect("/userProfile");
    }
  },
  addressManage: async (req, res) => {
    let userId = req.session.userId;
    const cartView = await cartModel.findOne({ userId });
    const category = await CategoryModel.find();
    const applience = await applienceModel.find();
    const products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience");
    const userAddress = await userModel.findOne({ userId });
    let user = req.session.userLogin;
    if (cartView) {
      var cartLength = cartView.products.length;
    } else {
      var cartLength = 0;
    }
    res.render("user/address", {
      user,
      name: req.session.user,
      applience,
      products,
      userAddress,
      category,
      cartLength,
    });
  },
  addNumber: async (req, res) => {
    let number = req.body.number;
    console.log(number, "number");
    let userId = req.session.userId;
    await userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { phone: number } }
    );
    res.redirect("/userProfile");
  },
  checkout: async (req, res) => {
    let userId = req.session.userId;
    const userAddress = await userModel.findOne({ userId });
    const cartView = await cartModel.findOne({ userId });
    const category = await CategoryModel.find();
    const applience = await applienceModel.find();
    const products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience");
    let user = req.session.userLogin;

    if (cartView) {
      var cartLength = cartView.products.length;
    } else {
      var cartLength = 0;
    }

    res.render("user/checkout", {
      user,
      cartView,
      name: req.session.user,
      applience,
      products,
      category,
      cartLength,
      userAddress,
    });
  },
  deactivateAccount: async (req, res) => {
    let data = req.body.accountActivation;
    console.log(data);
    let userId = req.session.userId;

    if (data == "on") {
      let userData = await userModel.findOneAndDelete({ _id: userId });
      req.session.loggedOut = true;
      req.session.destroy();

      res.redirect("/");
    } else {
      console.log("helo");
      res.redirect("/userProfile");
    }
  },

  //search products
  seachProducts: async (req, res) => {
    try {
      let userId = req.session.userId;
      const cartView = await cartModel.findOne({ userId });
      if (cartView) {
        var cartLength = cartView.products.length;
      } else {
        var cartLength = 0;
      }

      const pageNum = Number(req.query.page);
      const perPage = 3;

      let docCount;

      let user = req.session.userLogin;
      const category = await CategoryModel.find();
      const applience = await ApplienceModel.find();


      searchData = req.body.search;
     
      var products = await productModel.find({
        productName: { $regex:new RegExp("^" + searchData + ".*",'i')},
      });
      if (products.length > 0) {
        res.render("user/shopView", {
          user,
          name: req.session.user,
          applience,
          products,
          category,
          cartLength,
          currentPage: pageNum,
          totalDocuments: docCount,
          pages: Math.ceil(docCount / perPage),
          shop: true,
        });
      } else {
        res.render("user/shopView", {
          user,
          name: req.session.user,
          applience,
          products: false,
          category,
          cartLength,
          currentPage: pageNum,
          totalDocuments: docCount,
          pages: Math.ceil(docCount / perPage),
          shop: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },
  userOrdering: async (req, res) => {

    let userId = req.session.userId;
    await userModel.findOneAndUpdate({_id:userId},{$set:{applyCoupon:false}}).then((re)=>{console.log(re,'yssssss');})
    
    const oderBody = req.body;
    const User = await UserModel.findOne({ userId });
    const codOrder = User.Address.at(oderBody.id);
    console.log(oderBody.payment, "p");
    const status =
      oderBody.payment === "cash on delivery" ? "Placed" : "Pending";
    const paymentStatus =
      oderBody.payment === "cash on delivery" ? "Unpaid" : "Paid";
    console.log(status, "status");
    console.log(paymentStatus, "payment Status");
    let date = new Date();
    const cart = await cartModel.findOne({ userId });
    console.log(cart, cart);
    const totalProduct = cart.products.length;
    const amount = cart.total;
    const userOrder = {
      Address: {
        firstName: codOrder.firstName,
        lastName: codOrder.lastName,
        mobileNo: codOrder.mobileNo,
        address: codOrder.address,
        city: codOrder.city,
        locality: codOrder.locality,
        landmark: codOrder.landmark,
        pincode:codOrder.pincode
      },
      userId: userId,
      items: cart.products,
      paymentStatus: paymentStatus,
      orderStatus: status,
      paymentMethod: oderBody.payment,
      totalProduct: totalProduct,
      totalAmount: amount,
    };
    const orderId = await orderModel.create(userOrder);

    if (oderBody.payment == "cash on delivery") {
      await cartModel.updateOne(
        { userId: userId },
        {
          $set: {
            products: [],
            total: "",
          },
        }
      );
      res.json({ codSuccess: true });
      console.log("jii");
    }
    else{
      var options = {
          amount: amount , // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + orderId._id,
      };
      instance.orders.create(options, function (err, order) {
        
          res.json({ order, userOrder, User });
      });
  }
  },
  oderSuccessPage: async (req, res) => {
    let userId = req.session.userId;
    console.log(userId);
    const cartView = await cartModel.findOne({ userId });
    const userDetails = await userModel.findOne({ userId });
    const category = await CategoryModel.find();
    const applience = await applienceModel.find();
    const products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience");
    let user = req.session.userLogin;
    if (cartView) {
      var cartLength = cartView.products.length;
    } else {
      var cartLength = 0;
    }
    let lastOrder= await orderModel.find({userId:userId})
    let length= lastOrder.length;
    console.log(length);
    length=length-1;
    lastOrder= await orderModel.findOne({userId:userId}).skip(length)
    let discount= await cartModel.findOne({userId:userId})
    let couponDiscount=discount.couponDiscount;
    let couponApply= userDetails.applyCoupon
    console.log(couponApply);
    res.render("user/oderSuccessPage", {
      user,
      name: req.session.user,
      applience,
      products,
      userDetails,
      category,
      cartLength,
      lastOrder,
      couponDiscount,
      couponApply
    });
  },
  oderView: async (req, res) => {
    let userId = req.session.userId;
    console.log(userId);
    const cartView = await cartModel.findOne({ userId });
    const userDetails = await userModel.findOne({ userId });
    const category = await CategoryModel.find();
    const applience = await applienceModel.find();
    const products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience");
    let user = req.session.userLogin;
    if (cartView) {
      var cartLength = cartView.products.length;
    } else {
      var cartLength = 0;
    }
    const placedOders = await orderModel.find({$and:[{userId: userId},{$or:[{orderStatus:"Placed"},{orderStatus:"Shipped"}]}]});
    const deliveredOders= await orderModel.find({$and:[{userId: userId},{orderStatus:"Delivered"}]});
    const cancelOders= await orderModel.find({$and:[{userId: userId},{orderStatus:"Canceled"}]});
    // console.log(placedOders,'placed');
    // console.log(deliveredOders,'delivered');
    // console.log(cancelOders,'canceled');
    const allOders= await orderModel.find({userId})
    res.render("user/oderView", {
      user,
      name: req.session.user,
      applience,
      products,
      userDetails,
      category,
      cartLength,
      placedOders,
      deliveredOders,
      cancelOders,
      allOders
    });
  },
  singleOder: async (req, res) => {
    const oderid = req.params.id;
    console.log(oderid,'oderid');

    
    let userId = req.session.userId;
    const cartView = await cartModel.findOne({ userId });
    const userDetails = await userModel.findOne({ userId });
    const category = await CategoryModel.find();
    const applience = await applienceModel.find();
    const products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience");
      let user = req.session.userLogin;
    if (cartView) {
      var cartLength = cartView.products.length;
    } else {
      var cartLength = 0;
    }
    const singleOrder = await orderModel.findOne({_id:oderid });
    console.log(singleOrder,'single');
    res.render('user/singleOrderView',{

      user,
      name: req.session.user,
      applience,
      products,
      userDetails,
      category,
      cartLength,
      singleOrder
    })
  },
  cancelOrder:async (req,res)=>{
   const orderId=req.params.id;
    await orderModel.findByIdAndUpdate({_id:orderId},{$set:{orderStatus:"Canceled"}})
    res.redirect('/oderView')
  },
  userAddressEdit:async (req,res)=>{
    try {
      const { id } = req.query;
      const userAddress = req.body;
      const userId = req.session.userId;
      const user = await userModel.findOne({ _id: userId });
      console.log(user,'uer');
      console.log(userAddress,'user_add');
      console.log(id,'idsd');
      const addressObj = {
          firstName: userAddress.firstName,
          lastName: userAddress.lastName,
          mobileNo: userAddress.mobileNo,
          address: userAddress.address,
          city: userAddress.city,
          locality: userAddress.locality,
          landmark: userAddress.landmark,
          pinCode: userAddress.pinCode,
      };
      user.Address[id] = addressObj;
      await user.save();
      res.redirect("/addressManage");
  } catch (error) {
      console.log(error.message);
      
  }
},
userAddressDelete:async(req,res)=>{
  try {
    const { id } = req.query;
    const userId = req.session.userId;
    const user = await userModel.findOne({ _id: userId });
    console.log(id,'id');
    console.log(userId,'userid');
    console.log(user,'user');
    user.Address.splice(id, 1);
    await user.save();
    res.redirect("/addressManage");
} catch (error) {
    console.log(error.message);
    
}
},
forgotPasswordPage: (req,res)=>{
 
    res.render('user/forgotPassword')
 
},
forgotPassword: async(req,res)=>{
  const email=req.body.email;
 const userEmail=await userModel.find({email:email})
 if(userEmail){
  var mailOptions = {
    to: req.body.email,
    subject: "Otp for registration is: ",
    html:
      "<h3>OTP for account verification is </h3>" +
      "<h1 style='font-weight:bold;'>" +
      otp +
      "</h1>", // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.render("user/forgotPass-verificationEmail",{email:req.body.email});
  });
 }else{
 res.redirect('/forgotPassword')
 }

},
forgotPassVerify:(req,res)=>{
  let otp=req.body.otp
  let email=req.body.email
  console.log(email,'email');
  if(otp==req.body.otp){
    res.render('user/changePassword',{email:req.body.email})
  }else{
   res.redirect('/forgotVerify')
  }
},
changePassword: async(req,res)=>{
  let password=req.body.password
  let repassword=req.body.repassword
  let email=req.body.email
  if(password==repassword){
     password=   await  bcrypt.hash(password,10);
      
      
    await UserModel.findOneAndUpdate({email:email},{$set:{password:password}})
      res.redirect('/signin')
  }
  else{
    res.redirect('/changePassword')
  }
},
couponViewPage:async (req,res)=>{
  let userId = req.session.userId;
  const cartView = await cartModel.findOne({ userId });
  const userDetails = await userModel.findOne({ userId });
  const category = await CategoryModel.find();
  const applience = await applienceModel.find();
  const products = await ProductModel.find({})
    .populate("Category")
    .populate("Applience");
    let user = req.session.userLogin;
  if (cartView) {
    var cartLength = cartView.products.length;
  } else {
    var cartLength = 0;
  }
  let coupons= await couponModel.find({})
  res.render('user/userCoupon',{

    user,
    name: req.session.user,
    applience,
    products,
    userDetails,
    category,
    cartLength,
    coupons
  })
},
applyCoupon: async (req,res)=>{
  try {
    let userId = req.session.userId
    console.log('Hii');
    console.log(userId,'userId');
    const user = await userModel.findById(userId)
    console.log(req.body);
    const CouponCode = req.body.coupon
    const amountTotal=req.body.amountTotal
    let total = parseInt(amountTotal)
    let coupon = await couponModel.findOne({ couponCode: CouponCode })
    let date = new Date()
    console.log(CouponCode, total);
    if (user.applyCoupon) {
      console.log('ajanassss');
        await userModel.updateOne({_id:userId} ,{
                $set:{
                    applyCoupon:false
                }
            })
            console.log(coupon,"=======");
        await userModel.updateOne({_id:userId} ,{
                $pull:{
                    usedCoupon:{
                        couponId:coupon._id,
                        code:coupon.couponCode,
                    }
                }
            })
            res.json({removeCoupon:true})
    } else {
        if(CouponCode == ''){
            res.json(false)
        }else{
          console.log(coupon._id,'id');
            const existCoupon = await userModel.findOne({_id:userId,'usedCoupon.couponId':coupon._id})
        console.log(existCoupon,"exist");
        if (existCoupon) {
            res.json({exist:true})
        } else {
            if (coupon) {
            let percentage = coupon.percentage
            console.log(coupon.expiryDate);
            if (coupon.startDate <= date <= coupon.expiryDate) {
                console.log(total, coupon.minCartAmount);
                if (coupon.minCartAmount <= total) {
                    discount = (total * percentage) / 100
                    if (coupon.maxRadeemAmount >= discount) {
                        let totalLast = total - discount
                        await cartModel.updateMany(
                          {userId:userId},
                          {
                            $set: {
                              couponDiscount:discount,
                              subTotal:totalLast,
                              total:totalLast,

                            }
                          }
                        )
                        
                        await userModel.updateOne({_id:userId} ,{
                                $set:{
                                    applyCoupon:true
                                }
                        })
                        console.log('Hii');
                        await userModel.updateOne({_id:userId} ,{
                            $push:{
                                usedCoupon:{
                                    couponId:coupon._id,
                                    code:coupon.couponCode,
                                    couponUsed:date,
                                    couponName:coupon.couponName
                                }
                            }
                        })
                        console.log('Hii');
                        res.json({ success: true })
                    } else {
                        res.json({ maxRadeem: coupon.maxRadeemAmount })
                    }
                } else {
                    res.json({ minCart: coupon.minCartAmount })
                }
            } else {
                res.json({ expired: true })
            }
        } else {
            res.json({ invalid: true })
        }
        }
        }
    }
} catch (error) {
    console.log(error.message);
}

},
verifyPayment: async (req,res)=>{
  try {
    const userId = req.session.userId;
    await cartModel.updateOne(
      { userId: userId },
      {
        $set: {
          products: [],
          total: "",
        },
      }
    );
   let data=req.body
   console.log(data);
    
    console.log(data['payment[razorpay_order_id]'],'payment.razorpay_order_id');
    

    let hmac = crypto
        .createHmac("sha256", "OsyZNzqD3yBbJKKj6IeOmfxK")
        .update(data['payment[razorpay_order_id]']+'|'+data['payment[razorpay_payment_id]'])
        .digest("hex");
    const orderId = data['orders[receipt]'];
    console.log(hmac,'hmac');
    
    if (hmac == data['payment[razorpay_signature]']) {
        console.log('hiii');
        await orderModel.updateOne(
            { _id: orderId },
            {
                $set: {
                    orderStatus: "Placed",
                },
            }
        );
        await userModel.findOneAndUpdate({_id:userId},{$set:{applyCoupon:false}}).then((re)=>{console.log(re,'yssssss');})
        res.json({ status: true });
    } else {
        res.json({ status: false });
    }
} catch (error) {
    console.log(error.message);
    
}
},
newPassword: async (req,res)=>{
  let data=req.body.password
  
  data=  await bcrypt.hash(data,10);

  let userId=req.session.userId

  let user= await userModel.findById({_id:userId})
 
  let currentPassword= user.password


 if(userId){
 
  if( bcrypt.compare(data,currentPassword,)){
    res.render('user/changePassword',{email:user.email})
  }
  else{
    res.redirect('user/userProfile')
  }
 }
 
},
usedCouponPage:async (req,res)=>{
  let userId = req.session.userId;
  const cartView = await cartModel.findOne({ userId });
  const userDetails = await userModel.findOne({ userId });
  const category = await CategoryModel.find();
  const applience = await applienceModel.find();
  const products = await ProductModel.find({})
    .populate("Category")
    .populate("Applience");
    let user = req.session.userLogin;
  if (cartView) {
    var cartLength = cartView.products.length;
  } else {
    var cartLength = 0;
  }
  let usedCoupon= await userModel.findById({_id:userId})

  console.log(usedCoupon,'usedCoupon');
  res.render('user/usedCouponPage',{ user,
    name: req.session.user,
    applience,
    products,
    userDetails,
    category,
    cartLength,
    usedCoupon})
},
contactPage: async (req,res)=>{
  let userId = req.session.userId;
  const cartView = await cartModel.findOne({ userId });
  const userDetails = await userModel.findOne({ userId });
  const category = await CategoryModel.find();
  const applience = await applienceModel.find();
  const products = await ProductModel.find({})
    .populate("Category")
    .populate("Applience");
    let user = req.session.userLogin;
  if (cartView) {
    var cartLength = cartView.products.length;
  } else {
    var cartLength = 0;
  }
  res.render('user/Contact',{
    user,
    name: req.session.user,
    applience,
    products,
    userDetails,
    category,
    cartLength,
  })
}

};
