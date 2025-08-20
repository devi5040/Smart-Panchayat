const router = require("express").Router();
const userController = require("../controllers/user.controller");

router.post("/signed-url", userController.getSignedURL);

module.exports = router;
