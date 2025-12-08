const Staff = require("../model/staff");

exports.staffRegister = async (req, res) => {
    console.log("inside controller");

    let newStaff = await new Staff(req.body);
    newStaff.save().then((result) => {
        console.log("Data inserted");
    })
        .catch((err) => {
            console.log(err);
        });

};

