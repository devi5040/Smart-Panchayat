const router = require("express").Router();

const agentController = require("../controllers/agent.controller");

const validate = require("../middleware/validation.middleware");
const schema = require("../utils/validation/user.validate");

router.post(
  "/",
  validate(schema.createUserDataSchema),
  agentController.createAgent
);

router.patch("/:userId", agentController.changeRoleToAgent);

router.delete("/:agentId", agentController.removeAgent);

module.exports = router;
