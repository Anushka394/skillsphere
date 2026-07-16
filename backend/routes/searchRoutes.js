const express = require("express");
const r = express.Router();
const { searchFreelancers, searchGigs } = require("../controllers/searchController");
r.get("/freelancers", searchFreelancers);
r.get("/gigs", searchGigs);
module.exports = r;
