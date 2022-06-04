class Beacon {
  constructor(name, coords) {
    this.name = name;
    this.longitude = coords[0];
    this.latitude = coords[1];
    this.distance = null;
    this.absolutePosition = null;
    this.relativePosition = null;
  }
}

const locations = {
  // "Shenzhen": [
  //   113.9254101,
  //   22.5521136
  // ],
  // "Gates-Hillman": [
  //   -79.9459357,
  //   40.4437027
  // ],
  // "Hilton Garden Inn": [
  //   -79.95920386351325,
  //   40.43958908127134 
  // ],
  "Polaris": [
    -79.96076388226824,
    42
  ],
  // "Symmetric": [
  //   -79.960444+180,
  //   40.435122
  // ],
  // "Reflect": [
  //   -79.960444+180,
  //   -40.435122
  // ],
  // "Berlin": [
  //   13.3778127,
  //   52.5224018
  // ],
  // "Beijing": [
  //   116.383,
  //   39.9
  // ]
}

function registerLocations()
{
  var registeredLocations = [];
  for(const entry of Object.entries(locations))
  {
    console.log(entry)
    registeredLocations.push(new Beacon(entry[0], entry[1]))
  }
  return registeredLocations
}

module.exports = {
  Beacon: Beacon,
  registerLocations: registerLocations
}