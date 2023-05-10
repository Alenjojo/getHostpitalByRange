const express = require("express");
const MongoClient = require("mongodb").MongoClient;

const app = express();
const port = 3000;

const url = "mongodb://localhost:27017/range";
MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error("Error connecting to db:", err);
    // return;
  }

  console.log("Connected to the database");

  const db = client.db();

  app.get("/g", (req, res) => {
    const { location, emergency } = req.query;
    const [longitude, latitude] = location.split(",").map(parseFloat);

    db.collection("hospitals")
      .find({
        services: emergency,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          },
        },
      })
      .toArray((err, hospitals) => {
        if (err) {
          console.error("Error querying hospitals:", err);
          res.status(500).json({ error: "Internal server error" });
          return;
        }

        res.json(hospitals);
      });
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
