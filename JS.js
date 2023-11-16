// fetch select lokasi

// Define xmlToJson function
function xmlToJson(node) {
  const obj = {};

  if (node.nodeType === 1) {
    if (node.attributes.length > 0) {
      obj["@attributes"] = {};
      for (let j = 0; j < node.attributes.length; j++) {
        const attribute = node.attributes.item(j);
        obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
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

let dropdown = document.getElementById("lokasi");
let searchButton = document.getElementById("searchButton");
let iconSiaga = document.getElementById("icon-siaga");

// Clear existing options
dropdown.length = 0;

// Fetch XML data and initialize dropdown
fetch("https://poskobanjirdsda.jakarta.go.id/xmldata.xml")
  .then((response) => response.text())
  .then((data) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");
    const json = xmlToJson(xmlDoc.documentElement);

    const namaPintuAirList = json.SP_GET_LAST_STATUS_PINTU_AIR.map(
      (item) => item.NAMA_PINTU_AIR
    );

    namaPintuAirList.forEach((namaPintuAir) => {
      let option = document.createElement("option");
      option.text = namaPintuAir;
      option.value = namaPintuAir;
      dropdown.add(option);
    });

    // Set the initial dropdown value to "PS. Angke Hulu"
    dropdown.value = "PS. Angke Hulu";

    // Trigger the search button click event after setting the initial value
    searchButton.click();
  })
  .catch((error) => {
    console.error("Fetch Error:", error);
  });

// Function to fetch XML data
function fetchXML(selectedValue) {
  fetch("https://poskobanjirdsda.jakarta.go.id/xmldata.xml")
    .then((response) => response.text())
    .then((data) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");
      const json = xmlToJson(xmlDoc.documentElement);

      const selectedData = json.SP_GET_LAST_STATUS_PINTU_AIR.find(
        (item) => item.NAMA_PINTU_AIR === selectedValue
      );

      if (selectedData) {
        document.querySelector(".tanggal").textContent = selectedData.TANGGAL;
        document.querySelector(".lokasi").textContent =
          selectedData.NAMA_PINTU_AIR;
        document.querySelector(".tinggi-air").textContent =
          selectedData.TINGGI_AIR;
        document.querySelector(".status").textContent =
          selectedData.STATUS_SIAGA;

        if (selectedData.STATUS_SIAGA == "Status : Normal") {
          iconSiaga.src = "images/icon-normal.png";
        } else if (selectedData.STATUS_SIAGA == "Status : Siaga 1") {
          iconSiaga.src = "images/icon-siaga1.png";
        } else if (selectedData.STATUS_SIAGA == "Status : Siaga 2") {
          iconSiaga.src = "images/icon-siaga2.gif";
        } else if (selectedData.STATUS_SIAGA == "Status : Siaga 3") {
          iconSiaga.src = "images/icon-siaga3.png";
        }
      } else {
        console.error("Data not found for the selected location.");
      }
    })
    .catch((error) => {
      console.error("Fetch Error:", error);
    });
}

// Variables for Chart
let waterLevels = [];
let labels = [];

// chart
const ctx = document.getElementById("myChart");

myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: "Tinggi Air",
        data: waterLevels,
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

// Update Chart
function updateChart(labels, waterLevels) {
  // Check if the chart instance exists, then destroy it
  if (myChart) {
    myChart.destroy();
  }

  // Create a new chart instance with updated data
  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Tinggi Air",
          data: waterLevels,
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function fetchTimeline(idPintuAir) {
  // Fetch the content of the webpage
  fetch(
    `https://poskobanjirdsda.jakarta.go.id/Pages/GenerateDataTinggiAir.aspx?IdPintuAir=${idPintuAir}&StartDate=15/11/2023&EndDate=16/11/2023`
  )
    .then((response) => response.text())
    .then((data) => {
      // Split the data based on semicolons and commas
      let dataPoints = data.split(";");

      // Variables for chart
      waterLevels = [];
      labels = [];

      // Process each data point and extract the relevant information
      dataPoints.forEach(function (point) {
        let parts = point.split(",");
        if (parts.length === 2) {
          let timestamp = parts[0].trim();
          let value = parseInt(parts[1].trim(), 10);
          waterLevels.push(value);
          labels.push(timestamp);
        }
      });

      // Update chart
      updateChart(labels, waterLevels);
    })
    .catch((error) => console.error("Error fetching data:", error));
}

// Search Button
searchButton.addEventListener("click", function () {
  const selectedValue = dropdown.value;

  if (selectedValue !== "") {
    fetchXML(selectedValue);
    fetchTimeline("118");
  } else {
    console.warn("Please select a location before searching.");
  }
});

// Listen for changes in the dropdown selection
dropdown.addEventListener("change", function () {
  // Optionally, you can add additional logic here if needed
});
