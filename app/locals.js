module.exports = function(req, res, next) {

  // You can set any additional local variables here.
  // These will be made available to any views
  //
  // For example:
  //
  // req.locals.organisationName = 'NHS'

  res.locals.bsoName = "Mereford and Wensley Breast Screening Service"
  res.locals.bsoCode = "MW01"
  res.locals.staticBaseUnit = "Mereford and Wensley Screening Centre"
  res.locals.staticLocationShort = "Mereford and Wensley District Hospital"
  res.locals.mobileUnits = [
    "Davison",
    "Drummond",
    "Dunlop",
    "Garrud",
    "Howey",
    "Kenney",
    "Lenton",
    "Pankhurst"
  ]
  res.locals.locationsShort = [
    "Brookfield Sports Pavilion",
    "East Mereford Community Hub",
    "Kingsmead Swimming Centre",
    "Mereford Central",
    "Mereford Civic Centre",
    "Mereford Library",
    "Mereford Showground",
    "Northgate Food Hall",
    "Riverside Sports Centre",
    "South Mereford",
    "Wensley Community Hospital",
    "Wensley Cross",
    "Wensley Leisure Centre",
    "Wensley Park",
    "Wensley Town Hall",
    "West Wensley Foodstore"
  ]

  next()
}

