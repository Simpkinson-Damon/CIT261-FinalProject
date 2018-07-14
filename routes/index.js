// required modules
const Themeparks = require('themeparks');


module.exports = function(app) {

  app.get('/', function(req, res) {
    res.render('main', {title: 'WDW Park Wait Time Page'})
  });

  app.get('/getParkInfo', function(req,res) {
    let park = req.query.park;
    let myThemePark = setThemePark(park);
    myThemePark.GetWaitTimes().then(function(rides) {
      res.json(rides);
    })
  });


  // Last Exit, any unrouted request goes here
  app.all('*', function(req,res) {
    res.render('main', {title: 'WDW Park Wait Time Page'})
  });
};


function setThemePark(park){
  let myPark = "";
  switch(park){
    case "MK":
      myPark = new Themeparks.Parks.WaltDisneyWorldMagicKingdom();
      break;
    case "EPCOT":
      myPark = new Themeparks.Parks.WaltDisneyWorldEpcot();
      break;
    case "AK":
      myPark = new Themeparks.Parks.WaltDisneyWorldAnimalKingdom();
      break;
    case "HS":
      myPark = new Themeparks.Parks.WaltDisneyWorldHollywoodStudios();
      break;
    default:
      myPark = "";
      break;
  }
  return myPark;
}