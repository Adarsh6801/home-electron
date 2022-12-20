const { Router } = require('express');
const express=require('express')
const router=express.Router();
const adminController=require('../controler/adminController')



//--------------------------------------------GET METHOD-----------------------------------------------------

router.get('/',adminController.adminLogin);
router.get('/home',adminController.adminhomePage)
router.get('/adminProducts',adminController.adminProductsView);
router.get('/addproductspage',adminController.addProductpage);
router.get('/viewcategory',adminController.viewCategory);
router.get('/viewUser',adminController.viewUser);
router.get('/viewOder',adminController.viewOders);
router.get('/editproductpage/:id',adminController.editproductPage)
router.get('/viewapplience',adminController.viewApplience)
router.get('/productDetails/:id',adminController.productDetails)
router.get('/viewSingleOder/:id',adminController.viewSingleOder)
router.get('/viewCoupons',adminController.viewCouponPage)
router.get('/delete_coupon',adminController.deleteCoupon)
router.get('/salesReport',adminController.salesReportPage)
router.get('/adminProfile',adminController.adminProfile)
router.get('/adminLogout',adminController.adminLogout)
//--------------------------------------------POST METHOD-----------------------------------------------------

// router.post('/adminlog',adminController.adminHome);
router.post('/adminlog',adminController.adminHome);
router.post("/unblockUser/:id",adminController.unblockUser)
router.post("/blockUser/:id",adminController.blockUser)
router.post('/addproducts',adminController.addProduct)
router.post('/deleteProduct/:id',adminController.deleteProduct);
router.post("/unblockProduct/:id",adminController.unblockProduct)
router.post("/blockProduct/:id",adminController.blockProduct)
router.post("/addCategory",adminController.addCategory)
router.post('/deletecategory/:id',adminController.deleteCategory)
router.post('/addApplience',adminController.addApplience)
router.post('/deleteapplience/:id',adminController.deleteApplience)
router.post('/updateProduct/:id',adminController.updateProduct)
router.post('/add_coupon',adminController.addCoupon)
router.post('/status_change',adminController.statusChange)
router.post('/adminProfileChanges',adminController.adminProfileChanges)
module.exports=router
