const Driver = require("./driver_model");
const Loan = require("./loan_model");
const Station = require("./station_model");
const UserSession = require("./user_session_model");

const moment = require("moment");

let ussdConversation = async (req, res) => {
  // Read variables sent via POST from our SDK
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let currentInstruction = "";
  let previousText = "";
  let previousInstructionSet = [];
  let stations = [];
  try {
    let userSession = await UserSession.findOne({ phoneNumber: phoneNumber });

    console.log(":::::::::::::::::::    USER SESSION    :::::::::::::::::::::");
    console.log(userSession);

    if (userSession) {
      if (userSession?.sessionId === sessionId) {
        previousText = userSession?.sessionData?.previousText;
        previousInstructionSet =
          userSession?.sessionData?.previousInstructionSet;
        stations = userSession?.sessionData?.stations;
      }
    } else {
      try {
        userSession = new UserSession();
        let sessionData = {};
        sessionData["previousText"] = previousText;
        sessionData["previousInstructionSet"] = previousInstructionSet;
        sessionData["stations"] = stations;

        userSession.phoneNumber = phoneNumber;
        userSession.sessionId = sessionId;
        userSession.sessionData = sessionData;
        let userSessionDetails = await userSession.save(); //when fail its goes to catch
        console.log(userSessionDetails); //when success it print.
      } catch (error) {
        console.log(error);
        response = `END Internal server error occurred while registering the user. Please try again.`;
        previousText = "";
        previousInstructionSet = [];
        stations = [];
      }
    }

    console.log("####################", req.body);
    let response = "";

    currentInstruction = text.replace(previousText, "").replace("*", "");

    console.log(":::::::::::::    previousText   ::::::::::::");
    console.log(previousText);

    console.log(":::::::::::::    TEXT   ::::::::::::");
    console.log(text);

    console.log(":::::::::::::    previousInstructionSet   Before::::::::::::");
    console.log(previousInstructionSet);

    console.log(":::::::::::::    currentInstruction   ::::::::::::");
    console.log(currentInstruction);
    previousText = text;

    if (currentInstruction) {
      previousInstructionSet.push(currentInstruction);
    }

    console.log(":::::::::::::    previousInstructionSet   After::::::::::::");
    console.log(previousInstructionSet);

    if (text === "") {
      console.log(
        "Please select below option. 1. Register account 2. Take A Loan 3. Repay The Loan. 4. Know Defaulters"
      );

      response = `CON Please select below option.
         1. Register account
         2. Take A Loan
         3. Repay The Loan
         4. Know Defaulters`;
    } else if (previousInstructionSet[0] === "1") {
      console.log("SELECTED Register Account Option.");

      let driver = await Driver.findOne({ phoneNumber: phoneNumber });

      if (driver) {
        response = `END Driver is already registered with the mobile number ${phoneNumber}`;
        previousText = "";
        previousInstructionSet = [];
        stations = [];
      } else {
        if (!previousInstructionSet[1]) {
          console.log("Please enter driver name.");
          response = `CON Please enter driver name.`;
        } else if (previousInstructionSet[1] && !previousInstructionSet[2]) {
          // let usernameRegex = /^[a-zA-Z0-9]+$/;

          if (previousInstructionSet[1].length > 50) {
            previousInstructionSet.pop(currentInstruction);
            console.log(
              "Exceeded maximum characters. The maximum characters allowed for driver's name is 50. Please enter the driver name again."
            );
            response = `CON Exceeded maximum characters. The maximum characters allowed for driver's name is 50. Please enter the driver name again.`;
          } else {
            console.log("Please enter driving license.");
            response = `CON Please enter driving license.`;
          }
        } else if (
          previousInstructionSet[1] &&
          previousInstructionSet[2] &&
          !previousInstructionSet[3]
        ) {
          //license number
          let strFilter = /^[0-3][0-9]{7}$/;

          if (!strFilter.test(previousInstructionSet[2])) {
            previousInstructionSet.pop(currentInstruction);

            console.log(
              "Please enter valid 8-digit license number\r\n(Only digits)"
            );
            response = `CON Please enter valid 8-digit license number\r\n(Only digits)(eg., 12345678)`;
          } else {
            console.log("Please enter Motor RC details.");
            response = `CON Please enter Motor RC details.`;
          }
        } else if (
          previousInstructionSet[1] &&
          previousInstructionSet[2] &&
          previousInstructionSet[3] &&
          !previousInstructionSet[4]
        ) {
          //vehicle rc number
          let strFilter = /^[0-3][0-9]{7}$/;

          if (!strFilter.test(previousInstructionSet[3])) {
            previousInstructionSet.pop(currentInstruction);

            console.log(
              "Please enter valid 8-digit vehicle rc number\r\n(Only digits)(eg., 12345678)"
            );
            response = `CON Please enter valid 8-digit vehicle rc number\r\n(Only digits)(eg., 12345678)`;
          } else {
            console.log("Please enter driver's station.");
            response = `CON Please enter driver's station.`;

            let stationList = await Station.find({});
            console.log(
              ":::::::::::::::::::::   stationList   ::::::::::::::::"
            );
            console.log(stationList);

            if (stationList) {
              let stationListText = "\n";
              stationList.map((element, index) => {
                let stationData = {
                  stationId: element?._id,
                  stationName: element?.station_name,
                  optionNumber: index + 1,
                };
                stationListText =
                  stationListText +
                  (index + 1) +
                  ". " +
                  element?.station_name +
                  "\n";

                stations.push(stationData);
              });

              console.log(
                `Please choose any one of below station. ${stationListText}`
              );
              response = `CON Please choose any one of below station. ${stationListText}`;
            } else {
              // console.log("Please enter driver's station.");
              // response = `CON Please enter driver's station.`;
              console.log(
                "There are no stations configured. Please contact customer care regarding the issue at 999999999"
              );
              response = `END There are no stations configured. Please contact customer care regarding the issue at 999999999`;
              previousText = "";
              previousInstructionSet = [];
              stations = [];
            }
          }
        } else if (
          !previousInstructionSet[5] &&
          previousInstructionSet[1] &&
          previousInstructionSet[2] &&
          previousInstructionSet[3] &&
          previousInstructionSet[4]
        ) {
          let selectedStation = stations.filter(
            (element) =>
              element?.optionNumber === parseInt(previousInstructionSet[4])
          )[0];

          //let stationList = await Station.findById(selectedStation?._id);

          console.log("::::::::      selectedStation?._id   :::::::::");
          console.log(selectedStation?._id);

          let stationsListData = await Driver.find({
            assigned_station_id: selectedStation?.stationId,
          });

          console.log("::::::::   stationsListData  :::::::::::::::");
          console.log(stationsListData);

          if (stationsListData && stationsListData?.length >= 20) {
            console.log(
              "Exceeded the max number of drivers per station. Max number of drivers per station are 20."
            );
            response = `END Exceeded the max number of drivers per station. Max number of drivers per station are 20.`;
            previousText = "";
            previousInstructionSet = [];
            stations = [];
          } else if (previousInstructionSet[4].length > 50) {
            previousInstructionSet.pop(currentInstruction);

            console.log(
              "Station name max length is exceeded. Max length of station name is 50 characters"
            );
            response = `CON Station name max length is exceeded. Max length of station name is 50 characters`;
          } else {
            console.log("Do you want to confirm the details? 1. Yes 2. No");
            console.log("Driving Name is: " + previousInstructionSet[1]);
            console.log("Driving License is: " + previousInstructionSet[2]);
            console.log("Motor Cycle RC is: " + previousInstructionSet[3]);
            console.log("Driver's Station: " + selectedStation?.stationName);

            //   response = `CON Do you want to confirm the details?.
            // Driving License is: ${previousInstructionSet[1]}
            // Motor Cycle RC is: ${previousInstructionSet[2]}
            // Driver's Station: ${previousInstructionSet[3]}
            // 1. Yes
            // 2. No`;

            response = `CON Do you want to confirm the details?.
          Driver's Name is: ${previousInstructionSet[1]}
          Driving License is: ${previousInstructionSet[2]}
          Motor Cycle RC is: ${previousInstructionSet[3]}
          Driver's Station: ${selectedStation?.stationName}
          1. Yes 
          2. No`;
          }
        } else if (previousInstructionSet[5] === "1") {
          console.log(
            "Your account is successfully registered. You can use our services from now."
          );

          let selectedStation = stations.filter(
            (element) =>
              element?.optionNumber === parseInt(previousInstructionSet[4])
          )[0];

          try {
            let new_driver = new Driver();

            new_driver.phoneNumber = phoneNumber;
            new_driver.driver_name = previousInstructionSet[1];
            new_driver.driver_license = previousInstructionSet[2];
            new_driver.driver_bike_rc_no = previousInstructionSet[3];
            new_driver.assigned_station_id = selectedStation?.stationId;
            new_driver.assigned_station_name = selectedStation?.stationName;
            new_driver.created_by = phoneNumber;
            new_driver.last_updated_by = phoneNumber;
            let driverDetails = await new_driver.save(); //when fail its goes to catch
            console.log(driverDetails); //when success it print.

            response = `END Your account is successfully registered. You can use our services from now.`;
            previousText = "";
            previousInstructionSet = [];
            stations = [];
          } catch (err) {
            console.log(err);
            response = `END Internal server error occurred while registering the user. Please try again.`;
            previousText = "";
            previousInstructionSet = [];
            stations = [];
          }
        } else if (previousInstructionSet[5] === "2") {
          console.log("GO TO DRIVING LICENSE INPUT");
          previousInstructionSet = ["1"];
          console.log("Please enter driver name.");
          response = `CON Please enter driver name.`;
        } else {
          console.log("Entered wrong option.");

          response = `CON Selected wrong option. Do you want to confirm the details?.
        Driver's Name is: ${previousInstructionSet[1]}
        Driving License is: ${previousInstructionSet[2]}
        Motor Cycle RC is: ${previousInstructionSet[3]}
        Driver's Station: ${previousInstructionSet[4]}
        1. Yes 
        2. No`;
        }
      }
    } else if (previousInstructionSet[0] === "2") {
      console.log("SELECTED Take A Loan Option.");

      let isUserRegistered = false;
      let isDefaulters = false;

      let driver = await Driver.findOne({ phoneNumber: phoneNumber });

      if (driver) {
        isUserRegistered = true;
      }

      // $gte: moment().subtract(1, "days").startOf("day").toDate(),
      const loanDetailsOfPreviousDay = await Loan.find({
        loan_taken_date: {
          $lte: moment().subtract(1, "days").endOf("day").toDate(),
        },
        loan_payment_status: "UNPAID",
        assigned_station_id: driver?.assigned_station_id,
      });

      console.log(
        "::::::::::::::::       loanDetailsOfPreviousDay      ::::::::::::::::::"
      );
      console.log(loanDetailsOfPreviousDay);

      if (loanDetailsOfPreviousDay && loanDetailsOfPreviousDay?.length > 0) {
        isDefaulters = true;
      }
      if (!isUserRegistered) {
        console.log(
          `Driver is not registered with this mobile number: ${phoneNumber}. Please register the user to take a loan.`
        );
        response = `END Driver is not registered with this mobile number: ${phoneNumber}. Please register the user to take a loan.`;
        previousText = "";
        previousInstructionSet = [];
        stations = [];
      } else if (isUserRegistered && isDefaulters) {
        console.log(
          "Defaulters did not pay the previous loan amount. Please help us to pay loan by defaulters to get your next loan."
        );

        response = `END Defaulters did not pay the previous loan amount. Please help us to pay loan by defaulters to get your next loan.`;
        previousText = "";
        previousInstructionSet = [];
        stations = [];
      } else if (!previousInstructionSet[1]) {
        // let driverLoan = await Loan.findOne({ loan_taken_by_id: phoneNumber });

        let driverLoan = await Loan.findOne({
          loan_taken_by_id: phoneNumber,
          loan_taken_date: {
            $gte: moment().startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
          loan_payment_status: "UNPAID",
        });

        console.log(":::::::::::::::::::::   driverLoan   ::::::::::::::::");
        console.log(driverLoan);

        if (driverLoan && driverLoan?.loan_amount >= 5000) {
          console.log(
            `You have already taken the maxmimum limit of loan ${driverLoan?.loan_amount} for today. You can't take loan without repaying the current loan. Please repay the loan to get next loan.`
          );
          previousInstructionSet.pop(currentInstruction);
          response = `END You have already taken the maxmimum limit of loan ${driverLoan?.loan_amount} for today. You can't take loan without repaying the current loan. Please repay the loan to get next loan.`;
          previousText = "";
          previousInstructionSet = [];
          stations = [];
        } else {
          console.log("Please enter the amount.");
          response = `CON Please enter the amount.`;
        }
      } else if (previousInstructionSet[1] && !previousInstructionSet[2]) {
        let loanAmount = parseInt(previousInstructionSet[1]);
        console.log(loanAmount);

        // let driverLoan = await Loan.findOne({ loan_taken_by_id: phoneNumber });

        let driverLoan = await Loan.findOne({
          loan_taken_by_id: phoneNumber,
          loan_taken_date: {
            $gte: moment().startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
          loan_payment_status: "UNPAID",
        });
        console.log(":::::::::::::::::::::   driverLoan   ::::::::::::::::");
        console.log(driverLoan);

        if (Number.isNaN(loanAmount)) {
          console.log("Loan Amount is not a number.");
          previousInstructionSet.pop(currentInstruction);
          response = `CON You have entered invalid number. Please enter valid number.`;
        } else if (loanAmount > 5000) {
          console.log("Loan Amount is greater than maximum limit.");
          previousInstructionSet.pop(currentInstruction);
          response = `CON You can take a maximum loan of 5000 only. Please enter valid number.`;
        } else {
          let totalLoanAmount =
            (driverLoan?.loan_amount ? driverLoan?.loan_amount : 0) +
            loanAmount;

          if (totalLoanAmount > 5000) {
            console.log("Loan Amount is greater than maximum limit.");
            previousInstructionSet.pop(currentInstruction);
            response = `CON You have taken a loan of ${driverLoan?.loan_amount} today. You can take a maximum loan of 5000 only. Please enter the amount again.`;
          } else {
            console.log(
              "You have entered the amount: " +
                previousInstructionSet[1] +
                ". Do you want to confirm the amount. 1. Yes 2. No"
            );
            response = `CON Your total loan amount will be: ${totalLoanAmount} . Do you want to confirm the amount. 
        1. Yes
        2. No`;
          }
        }
      } else if (previousInstructionSet[2] === "1") {
        console.log(
          "Your loan amount " +
            previousInstructionSet[1] +
            " is successfully credited to your account."
        );

        // let driverLoan = await Loan.findOne({ loan_taken_by_id: phoneNumber });
        let driverLoan = await Loan.findOne({
          loan_taken_by_id: phoneNumber,
          loan_taken_date: {
            $gte: moment().startOf("day").toDate(),
            $lte: moment().endOf("day").toDate(),
          },
          loan_payment_status: "UNPAID",
        });

        console.log(":::::::::::::::::::::   driverLoan   ::::::::::::::::");
        console.log(driverLoan);

        try {
          let totalLoanAmount =
            (driverLoan?.loan_amount ? driverLoan?.loan_amount : 0) +
            parseInt(previousInstructionSet[1]);

          console.log("::::::::::   driver       :::::::::::");
          console.log(driver);
          if (driverLoan) {
            driverLoan.sessionId = sessionId;
            driverLoan.loan_taken_drivername =
              driverLoan?.loan_taken_drivername;
            driverLoan.loan_taken_by_id = driverLoan?.loan_taken_by_id;
            driverLoan.loan_payment_status = "UNPAID";
            driverLoan.assigned_station_id = driver?.assigned_station_id;
            driverLoan.assigned_station_name = driver?.assigned_station_name;
            driverLoan.loan_amount =
              (driverLoan?.loan_amount ? driverLoan?.loan_amount : 0) +
              parseInt(previousInstructionSet[1]);
            driverLoan.loan_taken_date = Date.now();

            let loanDetails = await driverLoan.save(); //when fail its goes to catch
            console.log(loanDetails); //when success it print.
            response = `END Your loan amount ${totalLoanAmount} is successfully credited to your account.`;
            previousText = "";
            previousInstructionSet = [];
            stations = [];
          } else {
            let loan = new Loan();
            loan.sessionId = sessionId;

            loan.loan_taken_drivername = driver?.driver_name;
            loan.loan_taken_by_id = phoneNumber;
            loan.loan_payment_status = "UNPAID";
            loan.assigned_station_id = driver?.assigned_station_id;
            loan.assigned_station_name = driver?.assigned_station_name;
            loan.loan_amount = parseInt(previousInstructionSet[1]);

            let loanDetails = await loan.save(); //when fail its goes to catch
            console.log(loanDetails); //when success it print.
            response = `END Your loan amount ${totalLoanAmount} is successfully credited to your account.`;
            previousText = "";
            previousInstructionSet = [];
            stations = [];
          }
        } catch (err) {
          console.log("::::::::::::    Error    :::::::::::::::::");
          console.log(err);
          response = `END Internal server error occurred while registering the user. Please try again.`;
          previousText = "";
          previousInstructionSet = [];
          stations = [];
        }
      } else if (previousInstructionSet[2] === "2") {
        console.log("GO TO ENTER AMOUNT");

        previousInstructionSet = ["2"];
        response = `CON Please enter the amount.`;
      } else {
        console.log("Entered Wrong Option.");
        previousInstructionSet.pop(currentInstruction);

        response = `CON Selected wrong option. You have entered the amount: ${previousInstructionSet[1]} . Do you want to confirm the amount. 
      1. Yes
      2. No`;
      }
    } else if (previousInstructionSet[0] === "3") {
      console.log("SELECTED Repay The Loan Option.");

      let pendingAmount = 0;

      let loan = await Loan.findOne({
        loan_taken_by_id: phoneNumber,
        loan_payment_status: "UNPAID",
      });
      console.log(":::::::::::::::::::::   loan   ::::::::::::::::");
      console.log(loan);
      if (loan) {
        pendingAmount = loan?.loan_amount;
        if (!previousInstructionSet[1]) {
          response = `CON You have total pending amount of ${pendingAmount}. Please confirm
            1.  Correct
            2.  Wrong`;
        } else if (previousInstructionSet[1] === "1") {
          try {
            loan.loan_payment_status = "PAID";
            loan.loan_paid_date = Date.now();

            let loanDetails = await loan.save(); //when fail its goes to catch
            console.log(loanDetails); //when success it print.
            response = `END Your repayment of amount ${pendingAmount}. is paid successfully. Thanks for using services.`;
            previousText = "";
            previousInstructionSet = [];
            stations = [];
          } catch (err) {
            console.log(
              ":::::::::::::::::::    error    :::::::::::::::::::::"
            );
            console.log(err);
            response = `END Internal server error occurred while registering the user. Please try again.`;
            previousText = "";
            previousInstructionSet = [];
            stations = [];
          }
        } else if (previousInstructionSet[1] === "2") {
          response = `END Please contact Customer Care regardig the wrong loan amount related issues at 999999999`;
          previousText = "";
          previousInstructionSet = [];
          stations = [];
        } else {
          previousInstructionSet.pop(currentInstruction);
          response = `CON Selected wrong option. You have total pending amount of ${pendingAmount}. Please confirm
        1.  Correct
        2.  Wrong`;
        }
      } else {
        response = `END You don't have pending amount for the day. You can take new loan.`;
        previousText = "";
        previousInstructionSet = [];
        stations = [];
      }
    } else if (previousInstructionSet[0] === "4") {
      console.log("SELECTED Know Defaulters Option.");
      let isUserRegistered = false;
      let defaultersList = "";
      let driver = await Driver.findOne({ phoneNumber: phoneNumber });

      if (driver) {
        isUserRegistered = true;
      }

      if (!isUserRegistered) {
        console.log(
          `Driver is not registered with this mobile number: ${phoneNumber}. Please register the user to take a loan.`
        );
        response = `END Driver is not registered with this mobile number: ${phoneNumber}. Please register the user to take a loan.`;
        previousText = "";
        previousInstructionSet = [];
        stations = [];
      } else {
        // $gte: moment().subtract(1, "days").startOf("day").toDate(),
        const loanDetailsOfPreviousDay = await Loan.find({
          loan_taken_date: {
            $lte: moment().subtract(1, "days").endOf("day").toDate(),
          },
          loan_payment_status: "UNPAID",
          assigned_station_id: driver?.assigned_station_id,
        });

        console.log(
          "::::::::::::::::       loanDetailsOfPreviousDay      ::::::::::::::::::"
        );
        console.log(loanDetailsOfPreviousDay);

        if (loanDetailsOfPreviousDay && loanDetailsOfPreviousDay?.length > 0) {
          loanDetailsOfPreviousDay.map((element, index) => {
            defaultersList =
              defaultersList +
              (index + 1) +
              ". " +
              element?.loan_taken_drivername +
              " : " +
              element?.loan_taken_by_id;
            ("\n");
          });

          response = `END Please find the below Defaulters.\n ${defaultersList}`;
          previousText = "";
          previousInstructionSet = [];
          stations = [];
        } else {
          response = `END There are no defaulters for today. You can avail your new loan upto 5000, if you did not taken yet.`;
          previousText = "";
          previousInstructionSet = [];
          stations = [];
        }
      }
    } else {
      console.log("SELECTED Wrong Option. Pls select correct option.");
      previousInstructionSet.pop(currentInstruction);

      response = `CON Selected wrong option. Please select any option from below.
    1. Register account
    2. Take A Loan
    3. Repay The Loan
    4. Know Defaulters`;
    }

    try {
      let sessionData = {};
      sessionData["previousText"] = previousText;
      sessionData["previousInstructionSet"] = previousInstructionSet;
      sessionData["stations"] = stations;
      userSession.phoneNumber = phoneNumber;
      userSession.sessionId = sessionId;
      userSession.sessionData = sessionData;
      let userSessionDetails = await userSession.save(); //when fail its goes to catch
      console.log(userSessionDetails); //when success it print.
    } catch (error) {
      console.log(error);
      response = `END Internal server error occurred while registering the user. Please try again.`;
      previousText = "";
      previousInstructionSet = [];
      stations = [];
    }

    // Print the response onto the page so that our SDK can read it
    res.set("Content-Type: text/plain");
    res.send(response);
    // DONE!!!
  } catch (error) {
    // previousInstructionSet = [];
    response = `END Internal server error occurred while registering the user. Please try again.`;
  }
};

exports.ussdConversation = ussdConversation;
