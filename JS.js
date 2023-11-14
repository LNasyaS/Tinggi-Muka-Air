// fetch select lokasi

let dropdown = document.getElementById('lokasi');
let searchButton = document.getElementById('searchButton');
let iconSiaga = document.getElementById('icon-siaga');

// Clear existing options
dropdown.length = 0;

// Add the default option
let defaultOption = document.createElement('option');
defaultOption.text = 'Pilih lokasi...';
defaultOption.value = ''; // Set an empty value for the default option
dropdown.add(defaultOption);
dropdown.selectedIndex = 0;

searchButton.addEventListener('click', function () {
  const selectedValue = dropdown.value;

  if (selectedValue !== '') {
    fetch("https://poskobanjirdsda.jakarta.go.id/xmldata.xml")
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");
        const json = xmlToJson(xmlDoc.documentElement);

        const selectedData = json.SP_GET_LAST_STATUS_PINTU_AIR.find(item => item.NAMA_PINTU_AIR === selectedValue);

        if (selectedData) {
          document.querySelector(".tanggal").textContent = selectedData.TANGGAL;
          document.querySelector(".lokasi").textContent = selectedData.NAMA_PINTU_AIR;
          document.querySelector(".tinggi-air").textContent = selectedData.TINGGI_AIR;
          document.querySelector(".status").textContent = selectedData.STATUS_SIAGA;
        } else {
          console.error('Data not found for the selected location.');
        }
        
        if(selectedData.STATUS_SIAGA == "Status : Normal"){
            iconSiaga.src = "images/icon-normal.png";
        }else if(selectedData.STATUS_SIAGA == "Status : Siaga 1"){
            iconSiaga.src = "images/icon-siaga1.png";
        }else if(selectedData.STATUS_SIAGA == "Status : Siaga 2"){
            iconSiaga.src = "images/icon-siaga2.gif";
        }else if(selectedData.STATUS_SIAGA == "Status : Siaga 3"){
            iconSiaga.src = "images/icon-siaga3.png";
        }
        
      })
      .catch(error => {
        console.error('Fetch Error:', error);
      });
  } else {
    console.warn('Please select a location before searching.');
  }

});

// Fetch XML data and populate dropdown
fetch("https://poskobanjirdsda.jakarta.go.id/xmldata.xml")
  .then(response => response.text())
  .then(data => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    const json = xmlToJson(xmlDoc.documentElement);

    const namaPintuAirList = json.SP_GET_LAST_STATUS_PINTU_AIR.map(item => item.NAMA_PINTU_AIR);

    namaPintuAirList.forEach(namaPintuAir => {
      let option = document.createElement('option');
      option.text = namaPintuAir;
      option.value = namaPintuAir;
      dropdown.add(option);
    });
  })
  .catch(console.error);

function xmlToJson(node) {
  const obj = {};

  if (node.nodeType === 1) {
    if (node.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let j = 0; j < node.attributes.length; j++) {
        const attribute = node.attributes.item(j);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    }

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];

      if (child.nodeType === 1) {
        const nodeName = child.nodeName;

        if (typeof obj[nodeName] === "undefined") {
          obj[nodeName] = xmlToJson(child);
        } else {
          if (!Array.isArray(obj[nodeName])) {
            obj[nodeName] = [obj[nodeName]];
          }
          obj[nodeName].push(xmlToJson(child));
        }
      } else if (child.nodeType === 3 && child.nodeValue.trim() !== "") {
        obj[node.nodeName] = child.nodeValue.trim();
      }
    }
  }

  if (Object.keys(obj).length === 1 && obj[node.nodeName]) {
    return obj[node.nodeName];
  }

  return obj;
}
