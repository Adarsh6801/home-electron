const { Router } = require('express');
const express=require('express');
const router=express.Router();
const userController=require('../controler/userController');

const userAuth=require('../middleware/auth')

//--------------------------------------------GET METHOD-----------------------------------------------------


router.get('/signin',userController.userlogin);
router.get('/signup',userController.userSignup);
router.get('/logout',userController.userLogout);

router.get('/',userController.homeView);


router.get('/shopView',userController.shopView);
router.get('/singleProduct/:id',userController.singleProductpage)
router.get('/categoryProductspage/:id',userController.categoryproductPage);
router.get('/homeView',userController.userHome)
router.get('/userCartpage',userAuth.sessionUser,userController.cartPage)
router.get('/removeWishlist/:id',userController. removeWishlist)
router.get('/userWishlist',userAuth.sessionUser, userController.wishlistPage)
router.get('/cartRemove/:id',userController.removeCart)
router.get('/userProfile',userAuth.sessionUser,userController.userProfilePage)
router.get('/addressManage',userController.addressManage)
router.get('/checkout',userAuth.sessionUser,userController.checkout)
router.get('/order_success',userAuth.sessionUser,userController.oderSuccessPage)
router.get('/oderView',userAuth.sessionUser,userController.oderView)
router.get('/singleOder/:id',userController.singleOder)
router.get('/cancelOrder/:id',userController.cancelOrder)
router.get('/user_address/delete',userController.userAddressDelete);
router.get('/forgotPass',userController.forgotPasswordPage)
router.get('/couponView',userAuth.sessionUser,userController.couponViewPage)
router.get('/usedCoupons',userController.usedCouponPage)
router.get('/contact',userController.contactPage)

//--------------------------------------------POST METHOD-----------------------------------------------------

router.post('/resendotp',userController.resendotp);
router.post('/otp',userController.otpVerifi);
router.post('/login',userController.doLogin);
router.post('/verifyotp',userController.verifyotp);
router.post('/addtoWishlist/:id',userController.addtoWishlist)
router.post('/addtocart/:id',userController.addtoCart)
router.post('/filtering',userController.filtering)
router.post('/profileChanges',userController.profileChange)
router.post('/addAddress',userController.addAddress)
router.post('/addNumber',userController.addNumber)
router.post('/deactivateAccount',userController.deactivateAccount)
router.post('/search',userController.seachProducts)
router.post('/user_order',userController.userOrdering)
router.post('/user_address/edit',userController.userAddressEdit)
router.post('/forgotPassword',userController.forgotPassword)
router.post('/forgotVerify',userController.forgotPassVerify)
router.post('/changePassword',userController.changePassword)
router.post('/coupon_verify',userController.applyCoupon)
router.post('/verify_payment',userController.verifyPayment)
router.post('/newPassword',userController.newPassword)
router.post('/cart_quantity',userController.cart_quantity);

module.exports=router;

