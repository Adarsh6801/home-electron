const express = require("express");
const UserModel = require("../model/userModel");
const ProductModel = require("../model/productModel");
const CategoryModel = require("../model/categoryModel");
const ApplienceModel = require("../model/applienceModel");
const orderModel = require("../model/orderModel");
const couponModel = require("../model/couponModel");
const adminModel=require('../model/adminModel')
const { response } = require("express");
const applienceModel = require("../model/applienceModel");
const app = express.Router();
const bcrypt=require('bcrypt')
const moment = require("moment");

module.exports = {
  // admin logi page
  adminLogin: (req, res) => {
    
    res.render("admin/adminlogin");
  },
  adminhomePage:async (req,res)=>{
    let orders= await orderModel.find({orderStatus:'Delivered'})
    let totalIncome = orders.reduce((acc,cur)=> acc+cur.totalAmount,0)
  console.log(totalIncome);

  let monthlyTtotalIncome = await orderModel.aggregate([
    {
        $match: {
            orderStatus: "Delivered",
        },
    },
    {
        $project: {
          totalAmount: true,
            createdAt: true,
        },
    },
    {
        $group: {
            _id: { $month: "$createdAt" },
            totalIncome: { $sum: "$totalAmount" },
        },
    },
    {
        $sort: {
            _id: 1,
        },
    },
]);
const month = [
    "jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
monthlyTtotalIncome = month.map((el, ind) => {
    const found = monthlyTtotalIncome.find((elm) => elm._id === ind + 1);
    return found ? found.totalIncome : 0;
});





let testDate = new Date();
let date = moment(testDate).format("MM");
date = parseInt(date) - 1;
let totalIncomeAtMonth = monthlyTtotalIncome[date];
totalIncomeAtMonth = Math.round(totalIncomeAtMonth);
monthlyTtotalIncome = JSON.stringify(monthlyTtotalIncome);


let lateMonth=parseInt(date) - 2
let totalIncomeAtlateMonth=monthlyTtotalIncome[lateMonth]
let profitMonth=totalIncomeAtMonth-totalIncomeAtlateMonth


console.log(profitMonth,'profit');


let todayTtotalIncome = await orderModel.aggregate([
    {
        $match: {
            orderStatus: "Delivered",
        },
    },
    {
        $project: {
          totalAmount: true,
            createdAt: true,
        },
    },
    {
        $group: {
            _id: { $dayOfMonth: "$createdAt" },
            totalIncome: { $sum: "$totalAmount" },
        },
    },
    {
        $sort: {
            _id: 1,
        },
    },
]);
const day = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
];
todayTtotalIncome = day.map((el, ind) => {
    const found = todayTtotalIncome.find((elm) => elm._id === ind + 1);
    return found ? found.totalIncome : 0;
});

let dayDate = moment(testDate).format("DD");
dayDate = parseInt(dayDate) - 1;
let totalIncomeAtDay = todayTtotalIncome[dayDate];
totalIncomeAtDay = Math.round(totalIncomeAtDay);

let yesturday=parseInt(dayDate) - 2;
let totalIncomeAtYesturaday=todayTtotalIncome[yesturday]
let profitDay=totalIncomeAtDay-totalIncomeAtYesturaday

let usersCount= await UserModel.find({status:'Unblocked'}).count();
let thisDate=Date()
let todayUsers =await UserModel.find({$and:[{status:'Unblocked'},{updatedAt:thisDate}]}).count();

let totalOrders= await orderModel.find({$or:[{orderStatus:'Placed'},{orderStatus:'Delivered'},{orderStatus:'Processed'}]}).count()

let placedOders= await orderModel.find({orderStatus:'Placed'}).count()
let canceledProducts= await orderModel.find({orderStatus:'Canceled'}).count()

let onlineTransactions= await orderModel.find({$and:[{orderStatus:'Delivered'},{paymentMethod:'online payment'}]}).count()
let cashondeliveryTransactions= await orderModel.find({$and:[{orderStatus:'Delivered'},{paymentMethod:'cash on delivery'}]}).count()
    res.render("admin/adminHome",{totalIncome,totalIncomeAtMonth,totalIncomeAtDay,dayDate,date,profitDay,profitMonth,usersCount,todayUsers,totalOrders,placedOders,canceledProducts,onlineTransactions,cashondeliveryTransactions});
  },
  //admin home
  adminHome:async (req, res) => {
    if(!req.session.adminLogin){
      let data=req.body
      let email=data.email
      let pass=data.password
      console.log(email,'email');
      
  let adminData= await adminModel.findOne({adminEmail:email})
     console.log(adminData,'Admindata');
    
      
  if(adminData){
    let adminPass=adminData.adminPass
  const password= await bcrypt.compare(pass,adminPass)
  
        if( password){
          req.session.adminLogin=true;
          req.session.adminId=adminData._id;
          console.log(req.session.adminId,'id');
          res.redirect('/admin/home')
        }
        else{
          res.redirect('/admin/')
        }
      
  }else{
    res.redirect('/admin/')
  }
    
    }else{
      res.redirect('/admin/')
    }
   

    
  },
  adminLogout:(req,res)=>{
    req.session.adminLogin = true;
    req.session.destroy();
    res.redirect("/admin/");
  },

  //admin view user page
  viewUser: async (req, res) => {
    const users = await UserModel.find({});
    res.render("admin/viewuser", { users, index: 1 });
  },
  //admin user block
  blockUser: async (req, res) => {
    const id = req.params.id;
    await UserModel.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "Blocked" } }
    ).then(() => {
      res.redirect("/admin/viewUser");
    });
  },
  //admin user block
  unblockUser: async (req, res) => {
    const id = req.params.id;
    await UserModel.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "Unblocked" } }
    ).then(() => {
      res.redirect("/admin/viewUser");
    });
  },
  //admin view product page
  adminProductsView: async (req, res) => {
    const products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience");
    console.log(products);
    res.render("admin/viewproducts", { products });
  },
  //admin add-product page view
  addProductpage: async (req, res) => {
    const category = await CategoryModel.find();
    const Applience = await ApplienceModel.find();
    res.render("admin/addproducts", { category, Applience });
  },
  //admin add-product
  addProduct: async (req, res) => {
    //admin post product
    const { productName, Brand, Applience, Category, Discription, Price } =
      req.body;

    let image = req.file;
    console.log(image);

    const newProduct = ProductModel({
      productName,
      Brand,
      Applience,
      Category,
      Discription,
      Price,
      image: image.filename,
    });

    await newProduct
      .save()
      .then(() => {
        res.redirect("/admin/adminProducts");
      })
      .catch((err) => {
        console.log(err.message);
        res.redirect("/admin/addproductspage");
      });
  },
  //oder view
  viewOders: async (req, res) => {
    const orders = await orderModel.find();
    console.log(order);
    res.render("admin/viewOder", { orders });
  },
  //delete Product
  deleteProduct: async (req, res) => {
    let id = req.params.id;
    console.log(id);
    await ProductModel.findByIdAndDelete({ _id: id });
    res.redirect("/admin/adminProducts");
  },
  // UnBlock Car
  unblockProduct: async (req, res) => {
    const id = req.params.id;
    await ProductModel.findByIdAndUpdate(
      { _id: id },
      { $set: { Status: "Unblocked" } }
    ).then(() => {
      res.redirect("/admin/adminProducts");
    });
  },

  // Block car
  blockProduct: async (req, res) => {
    const id = req.params.id;
    await ProductModel.findByIdAndUpdate(
      { _id: id },
      { $set: { Status: "Blocked" } }
    ).then(() => {
      res.redirect("/admin/adminProducts");
    });
  },
  //edit product page
  editproductPage: async (req, res) => {
    const id = req.params.id;

    const applience = await ApplienceModel.find();
    const category = await CategoryModel.find();
    const product = await ProductModel.findById({ _id: id })
      .populate("Category")
      .populate("Applience");
    console.log(product);
    res.render("admin/editproducts", { product, applience, category });
  },
  //admin view category page
  viewCategory: async (req, res) => {
    const category = await CategoryModel.find({});
    res.render("admin/viewcategory", { category });
  },
  //add category
  addCategory: async (req, res) => {
    let { Category } = req.body;
    console.log(Category);
    const newCategory = await CategoryModel({ Category: Category });

    newCategory.save().then(res.redirect("/admin/viewcategory"));
  },
  deleteCategory: async (req, res) => {
    let id = req.params.id;
    await CategoryModel.findByIdAndDelete({ _id: id });
    res.redirect("/admin/viewcategory");
  },
  //view Applience
  viewApplience: async (req, res) => {
    const Applience = await applienceModel.find({});
    res.render("admin/viewApplience", { Applience });
  },
  //add Applience
  addApplience: (req, res) => {
    let { Applience } = req.body;
    console.log(Applience);
    const newApplience = ApplienceModel({ Applience: Applience });

    newApplience.save().then(res.redirect("/admin/viewApplience"));
  },
  //delete Applience
  deleteApplience: async (req, res) => {
    let id = req.params.id;
    await ApplienceModel.findByIdAndDelete({ _id: id });
    res.redirect("/admin/viewApplience");
  },
  //update Product
  updateProduct: async (req, res) => {
    const { productName, Brand, Applience, Category, Discription, Price } =
      req.body;

    if (req.file) {
      let image = req.file;
      await ProductModel.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: { image: image.filename } }
      );
    }
    let details = await ProductModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { productName, Brand, Applience, Category, Discription, Price } }
    );
    await details.save().then(() => {
      res.redirect("/admin/adminProducts");
    });
  },
  productDetails: async (req, res) => {
    const products = await ProductModel.find({})
      .populate("Category")
      .populate("Applience");
    const product = await ProductModel.findById({ _id: req.params.id })
      .populate("Category")
      .populate("Applience");
    const applience = await ApplienceModel.find();
    const category = await CategoryModel.find();
    res.render("admin/productDetails", {
      product,
      products,
      applience,
      category,
    });
  },

  viewSingleOder: async (req, res) => {
    const oderId = req.params.id;
    console.log(oderId);
    const orderProducts = await orderModel.findById(oderId);
    console.log(orderProducts);
    res.render("admin/viewOderDetails", { orderProducts });
  },
  viewCouponPage: async (req, res) => {
    let coupon = await couponModel.find();
    console.log(coupon, "coupon");
    res.render("admin/couponView", { coupon, index: 1 });
  },
  addCoupon: async (req, res) => {
    let data = req.body;
    await couponModel.create(data);
    res.redirect("/admin/viewCoupons");
  },
  deleteCoupon: async (req, res) => {
    const { id } = req.query;
    await couponModel.deleteOne({ _id: id });
  },
  salesReportPage: async (req, res) => {
    let orders;
    let total;
    let sort = req.query;
    console.log(sort, "sort");
    if (sort.no == 1) {
      console.log("jij");
      const today = moment().startOf("day");

      console.log(today, "today");
      orders = await orderModel.find({
        orderStatus: "Placed",
        createdAt: {
          $gte: today.toDate(),
          $lte: moment(today).endOf("day").toDate(),
        },
      });
      total = orders.reduce((acc, cur) => acc + cur.totalAmount, 0);
      console.log(total, "total");
    } else if (sort.no == 2) {
      const month = moment().startOf("month");
      orders = await orderModel.find({
        orderStatus: "Placed",
        createdAt: {
          $gte: month.toDate(),
          $lte: moment(month).endOf("month").toDate(),
        },
      });
      total = orders.reduce((acc, cur) => acc + cur.totalAmount, 0);
      console.log(total,'total');
    }
    else if(sort.no==3){
        const year = moment().startOf('year')
    orders = await orderModel.find({
            orderStatus: 'Placed',
            createdAt: {
                $gte: year.toDate(),
                $lte: moment(year).endOf('year').toDate()
            }
        })
        total= orders.reduce((acc,cur)=>acc+cur.totalAmount,0);
    }
    else{
        orders= await orderModel.find()
        total=orders.reduce((acc,cur)=> acc+cur.totalAmount,0);
    }
   

    res.render("admin/salesReport", { orders, total,number:req.query.no });
  },
  statusChange: async (req,res)=>{
    try {
      const statusBody = req.body;
      const order = await orderModel.findById(statusBody.orderId);
     
      if (order.paymentMethod == "Cash on Delivery") {
          if (statusBody.status == "Delivered") {
              await orderModel.findByIdAndUpdate(statusBody.orderId, {
                  $set: {
                      orderStatus: statusBody.status,
                      paymentStatus: "Paid",
                  },
              });
          } else {
              await orderModel.findByIdAndUpdate(statusBody.orderId, {
                  $set: {
                      orderStatus: statusBody.status,
                      paymentStatus: "Unpaid",
                  },
              });
          }
      } else {
          await orderModel.findByIdAndUpdate(statusBody.orderId, {
              $set: {
                  orderStatus: statusBody.status,
              },
          });
      }

      res.json(true);
  } catch (error) {
      console.log(error.message);
    
  }
  },
  adminProfile:async (req,res)=>{
    let admin= await adminModel.findOne()

    res.render('admin/adminProfile',{admin})

  },
  adminProfileChanges:(req,res)=>{
    let data=req.body
    console.log(data,'data');

  }
};
