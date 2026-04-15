const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { getMessages, postMessages } = require("../controller/userController");

router.get("/:user1/:user2", getMessages);
router.post("/", postMessages);

module.exports = router;
